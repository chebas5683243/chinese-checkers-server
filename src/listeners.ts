import type { ServerType } from "@hono/node-server";
import type { Turn } from "./models/turn";
import type { Acknowledgement, SocketServer } from "./types/socket";

import * as cookie from "cookie";
import { Server } from "socket.io";
import { USER_ID_COOKIE } from "./constants/socket";
import * as service from "./service";
import { getUUID } from "./utils/random";

export function setupSocketListeners(httpServer: ServerType) {
  const io: SocketServer = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
    cookie: true,
  });

  io.engine.on("initial_headers", (headers, req) => {
    const existingCookies = cookie.parse(req.headers.cookie || "");
    const userId = existingCookies[USER_ID_COOKIE];

    console.log(req.headers.cookie);

    if (!userId) {
      const userIdCookie = cookie.serialize(USER_ID_COOKIE, getUUID(), {
        sameSite: "strict",
        httpOnly: true,
        path: "/",
      });
      headers["set-cookie"] = userIdCookie;
    }
  });

  io.on("connection", async (socket) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    console.log("userId", cookies);

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
      "sendMove",
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
