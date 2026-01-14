import { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { Socket } from "socket.io";

let io: IOServer;

const freeMods = new Set<string>();
const activePairs = new Map<string, string>();

export function initSocket(server: HTTPServer) {
  if (io) return io;

  io = new IOServer(server, {
    path: "/api/socket",
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("Connected:", socket.id);

    // MOD COMES ONLINE
    socket.on("mod:online", ({ modId }: { modId: string }) => {
      socket.data.role = "MOD";
      socket.data.modId = modId;
      freeMods.add(socket.id);
    });

    // USER CLICKS NEXT
    socket.on("user:next", () => {
      if (freeMods.size === 0) {
        socket.emit("no-mod-available");
        return;
      }

      const mods = Array.from(freeMods);
      const modSocketId =
        mods[Math.floor(Math.random() * mods.length)];

      freeMods.delete(modSocketId);

      activePairs.set(socket.id, modSocketId);
      activePairs.set(modSocketId, socket.id);

      socket.emit("chat:connected");
      io.to(modSocketId).emit("chat:connected");
    });

    // MESSAGE RELAY
    socket.on("chat:message", (msg: string) => {
      const partner = activePairs.get(socket.id);
      if (!partner) return;
      io.to(partner).emit("chat:message", msg);
    });

    // NEXT / END CHAT
    socket.on("chat:next", () => {
      const partner = activePairs.get(socket.id);
      if (!partner) return cleanup(socket.id);

      cleanup(socket.id);
      cleanup(partner);

      io.to(partner).emit("chat:ended");
      socket.emit("chat:ended");
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      cleanup(socket.id);
    });

    function cleanup(id: string) {
      const partner = activePairs.get(id);
      if (partner) {
        activePairs.delete(partner);

        if (io.sockets.sockets.get(partner)?.data.role === "MOD") {
          freeMods.add(partner);
        }
      }

      activePairs.delete(id);
      freeMods.delete(id);
    }
  });

  return io;
}
