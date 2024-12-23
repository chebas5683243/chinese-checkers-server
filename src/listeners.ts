import type { ServerType } from "@hono/node-server";
import type { Turn } from "./models/turn";
import type { Acknowledgement, SocketServer } from "./types/socket";

import * as cookie from "cookie";
import { Server } from "socket.io";
import { USER_ID_COOKIE } from "./constants/cookie";
import * as service from "./service";
import { logger } from "./utils/logger";
import { getUUID } from "./utils/random";

export function setupSocketListeners(httpServer: ServerType) {
  const io: SocketServer = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
    cookie: true,
    pingTimeout: 2000,
  });

  io.engine.on("initial_headers", (headers, req) => {
    const existingCookies = cookie.parse(req.headers.cookie || "");
    let userId = existingCookies[USER_ID_COOKIE];

    if (!userId) {
      userId = getUUID();
      const userIdCookie = cookie.serialize(USER_ID_COOKIE, userId, {
        sameSite: "strict",
        httpOnly: true,
        path: "/",
      });
      headers["set-cookie"] = userIdCookie;
    }

    req.headers.userId = userId;
  });

  io.use((socket, next) => {
    const userId = socket.handshake.headers.userId as string;

    if (!userId) {
      const errorMsg = "Failed to connect user";
      logger.error(socket.id, errorMsg);
      return next(new Error(errorMsg));
    }

    socket.data.userId = userId;
    logger.info(socket.id, `User connected: ${userId}`);
    next();
  });

  io.on("connection", async (socket) => {
    socket.on("joinGame", async (roomId, ack) => {
      try {
        logger.info(socket.id, `Joining game: ${roomId}`);

        const game = await service.findGame(roomId);
        const userId = socket.data.userId;

        socket.join(roomId);

        socket.to(roomId).emit("playerJoined", { socketId: socket.id, userId });

        const gameConnections = (await io.in(roomId).fetchSockets()).map(
          (socket) => ({ socketId: socket.id, userId: socket.data.userId })
        );

        ack({
          status: "success",
          data: { connections: gameConnections, game },
        });
      } catch (error: any) {
        logger.error(socket.id, error.message);
        ack({ status: "error", error: error.message });
      }
    });

    socket.on("leaveGame", async (roomId) => {
      try {
        logger.info(socket.id, `Leaving game: ${roomId}`);

        await service.findGame(roomId);
        const userId = socket.data.userId;

        socket.leave(roomId);

        socket.to(roomId).emit("playerLeft", { socketId: socket.id, userId });
      } catch (error: any) {
        logger.error(socket.id, error.message);
      }
    });

    socket.on("startGame", async (roomId, ack) => {
      try {
        logger.info(socket.id, `Starting game: ${roomId}`);

        const connectedPlayers = (await io.in(roomId).fetchSockets()).map(
          (socket) => socket.data
        );
        const userId = socket.data.userId;

        await service.initializeGame(roomId, userId);

        ack({ status: "success" });

        io.to(roomId).emit("gameStarting");

        // TODO: get rid of simulated delay for testing
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const game = await service.startGame(roomId, connectedPlayers, userId);

        io.to(roomId).emit("gameStarted", game);
      } catch (error: any) {
        logger.error(socket.id, error.message);
        ack({ status: "error", error: error.message });
      }
    });

    socket.on("sendMove", async (roomId, turn, boardHash, ack) => {
      try {
        logger.info(
          socket.id,
          `Sending move: ${JSON.stringify(turn)} to room ${roomId}`
        );

        const userId = socket.data.userId;

        await service.saveMoves(roomId, turn, userId, boardHash);

        socket.to(roomId).emit("opponentMove", turn, boardHash);
        ack({ status: "success" });
      } catch (error: any) {
        logger.error(socket.id, error.message);
        ack({ status: "error", error: error.message });
      }
    });

    socket.on("disconnecting", (reason) => {
      try {
        const userId = socket.data.userId;

        socket.rooms.forEach((room) => {
          io.to(room).emit("playerLeft", { socketId: socket.id, userId });
        });

        logger.info(
          socket.id,
          `User disconnected: ${socket.data.userId}, Reason: ${reason}`
        );
      } catch (error: any) {
        logger.error(socket.id, error.message);
      }
    });
  });
}
