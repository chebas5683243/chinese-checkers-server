import type { ServerType } from "@hono/node-server";
import { Server } from "socket.io";

export function setupSocketListeners(httpServer: ServerType) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

  io.on("connection", (socket) => {
    console.log("nConnections", io.sockets.sockets.size);

    console.log("connected", socket.id);

    socket.on("disconnect", (reason) => {
      console.log("disconnected", socket.id, reason);
    });
  });
}
