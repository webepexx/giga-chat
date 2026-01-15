import { Server as NetServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

const searchTimeouts = new Map<string, NodeJS.Timeout>();

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

type Role = "user" | "mod";

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    console.log("✅ Initializing Socket.IO");

    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    // ===============================
    // IN-MEMORY STATE
    // ===============================
    const freeMods = new Set<string>();
    const activeChats = new Map<string, string>();

    io.on("connection", (socket: Socket) => {
      // -------------------------------
      // ROLE LOCK (CRITICAL)
      // -------------------------------
      const role = socket.handshake.auth.role as Role;

      if (role !== "user" && role !== "mod") {
        console.log("❌ Invalid role, disconnecting:", socket.id);
        socket.disconnect();
        return;
      }

      socket.data.role = role;

      console.log(`🔌 Connected ${role}:`, socket.id);

      if (role === "mod") {
        freeMods.add(socket.id);
        console.log("🟢 Mod online:", socket.id);
      }

      // ===============================
      // USER: NEXT
      // ===============================
      socket.on("user:next", () => {
        if (socket.data.role !== "user") return;
      
        // 🧹 CLEAR PREVIOUS SEARCH
        const existingTimeout = searchTimeouts.get(socket.id);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          searchTimeouts.delete(socket.id);
        }
      
        endChat(socket);
      
        // NEVER allow user to be in mod pool
        freeMods.delete(socket.id);
      
        // random delay: 30s–120s (milliseconds)
        const min = 3*60*10
        const max = 12*60*10
        const delay =
          Math.floor(Math.random() * (max - min + 1)) + min;
      
        socket.emit("match:searching", delay);
      
        const timeout = setTimeout(() => {
          searchTimeouts.delete(socket.id);
      
          const modSocketId = [...freeMods].find(
            (id) => id !== socket.id
          );
      
          if (!modSocketId) {
            socket.emit("no-mod-available");
            return;
          }
      
          // ABSOLUTE GUARD
          if (modSocketId === socket.id) {
            console.error("🚨 SELF MATCH BLOCKED");
            return;
          }
      
          freeMods.delete(modSocketId);
      
          activeChats.set(socket.id, modSocketId);
          activeChats.set(modSocketId, socket.id);
      
          io.to(socket.id).emit("chat:connected");
          io.to(modSocketId).emit("chat:connected");
      
          console.log(
            `🔗 Chat connected after ${delay}ms: ${socket.id} ↔ ${modSocketId}`
          );
        }, delay);
      
        searchTimeouts.set(socket.id, timeout);
      });
      

      // ===============================
      // CHAT MESSAGE
      // ===============================
      socket.on("chat:message", (msg: string) => {
        const partner = activeChats.get(socket.id);
        if (partner) {
          io.to(partner).emit("chat:message", msg);
        }
      });

      // ===============================
      // NEXT / END CHAT
      // ===============================
      socket.on("chat:next", () => {
        endChat(socket);
      });

      // ===============================
      // DISCONNECT
      // ===============================
      socket.on("disconnect", () => {
        const timeout = searchTimeouts.get(socket.id);
        if (timeout) {
          clearTimeout(timeout);
          searchTimeouts.delete(socket.id);
        }
      
        endChat(socket);
        freeMods.delete(socket.id);
      });
      
      // ===============================
      // HELPERS
      // ===============================
      function endChat(socket: Socket) {
        const partner = activeChats.get(socket.id);
        if (!partner) return;
      
        activeChats.delete(socket.id);
        activeChats.delete(partner);
      
        io.to(partner).emit("chat:ended");
      
        // clear pending search
        const timeout = searchTimeouts.get(socket.id);
        if (timeout) {
          clearTimeout(timeout);
          searchTimeouts.delete(socket.id);
        }
      
        const partnerSocket = io.sockets.sockets.get(partner);
        if (partnerSocket?.data.role === "mod") {
          freeMods.add(partner);
        }
      }
      
    });

    res.socket.server.io = io;
  }

  res.end();
}
