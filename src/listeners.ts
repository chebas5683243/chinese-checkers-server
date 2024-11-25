import type { ServerType } from "@hono/node-server";

import { Server } from "socket.io";
import { service } from "./service";
import { Acknowledgement, ServerWithUser } from "./types/socket";

export function setupSocketListeners(httpServer: ServerType) {
  const io: ServerWithUser = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;

    if (!userId) {
      return next(new Error("Unauthorized"));
    }

    socket.data.userId = userId;
    next();
  });

  io.use((socket, next) => {
    console.log("nConnections", io.sockets.sockets.size);
    console.log("connected", socket.id);
    console.log("userId", socket.data.userId);
    next();
  });

  io.on("connection", (socket) => {
    socket.on("joinGame", async (roomId: string, ack: Acknowledgement) => {
      try {
        const game = await service.findGame(roomId);

        socket.join(roomId);

        socket.to(roomId).emit("playerJoined", { userId: socket.data.userId });

        ack({ status: "success", data: game });
      } catch (error: any) {
        ack({ status: "error", error: error.message });
      }
    });

    socket.on("startGame", async (roomId: string, ack: Acknowledgement) => {
      try {
        const connectedPlayers = (await io.in(roomId).fetchSockets()).map(
          (socket) => socket.data
        );

        await service.initializeGame(roomId, socket.data.userId);

        ack({ status: "success" });

        io.to(roomId).emit("gameStarting");

        await service.startGame(roomId, connectedPlayers, socket.data.userId);

        io.to(roomId).emit("gameStarted");
      } catch (error: any) {
        ack({ status: "error", error: error.message });
      }
    });

    socket.on("moveMade", () => {});

    socket.on("disconnect", (reason) => {
      socket.rooms.forEach((room) => {
        socket.to(room).emit("playerLeft", { userId: socket.data.userId });
      });
      console.log("disconnected", socket.id, reason);
    });
  });
}
