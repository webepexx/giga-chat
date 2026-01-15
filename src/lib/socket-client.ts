import { io, Socket } from "socket.io-client";

let socket: Socket;

export function getSocket() {
  if (!socket) {
    socket = io({
      path: "/api/socket/io",
      auth: {
        role: "user"
      }
    });
  }
  return socket;
}
