import type { ServerType } from "@hono/node-server";

import { Server } from "socket.io";
import { Turn } from "./models/turn";
import * as service from "./service";
import { Acknowledgement, ServerWithUser } from "./types/socket";
import * as cookie from "cookie";

export function setupSocketListeners(httpServer: ServerType) {
  const io: ServerWithUser = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
    },
    cookie: true,
  });

  io.engine.on("initial_headers", (headers) => {
    const mycookie = cookie.serialize("mycookie", "1234", {
      sameSite: true,
    });
    console.log("mycookie", mycookie);
    headers["set-cookie"] = mycookie;
  });

  // io.use((socket, next) => {
  //   console.log("weeee");
  //   const userId = socket.handshake.headers.cookie;
  //   console.log("userId", userId);

  //   if (!userId) {
  //     return next(new Error("Unauthorized"));
  //   }

  //   socket.data.userId = userId;
  //   next();
  // });

  // io.use((socket, next) => {
  //   console.log("nConnections", io.sockets.sockets.size);
  //   console.log("connected", socket.id);
  //   console.log("userId", socket.data.userId);
  //   next();
  // });

  io.on("connection", (socket) => {
    const userId = cookie.parse(socket.handshake.headers.cookie || "");
    console.log("userId2", userId);
    socket.on("joinGame", async (roomId: string, ack: Acknowledgement) => {
      try {
        const game = await service.findGame(roomId);
        const userId = socket.data.userId;

        socket.join(roomId);

        socket.to(roomId).emit("playerJoined", { userId });

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
        const userId = socket.data.userId;

        await service.initializeGame(roomId, userId);

        ack({ status: "success" });

        io.to(roomId).emit("gameStarting");

        await service.startGame(roomId, connectedPlayers, userId);

        io.to(roomId).emit("gameStarted");
      } catch (error: any) {
        ack({ status: "error", error: error.message });
      }
    });

    socket.on(
      "moveMade",
      async (
        roomId: string,
        turn: Turn,
        boardHash: string,
        ack: Acknowledgement
      ) => {
        try {
          const userId = socket.data.userId;

          await service.saveMoves(roomId, turn, userId, boardHash);

          socket.to(roomId).emit("opponentMove", { turn, boardHash });
          ack({ status: "success" });
        } catch (error: any) {
          ack({ status: "error", error: error.message });
        }
      }
    );

    socket.on("disconnect", (reason) => {
      socket.rooms.forEach((room) => {
        socket.to(room).emit("playerLeft", { userId: socket.data.userId });
      });
      console.log("disconnected", socket.id, reason);
    });
  });
}
