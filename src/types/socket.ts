import type { DefaultEventsMap, Server } from "socket.io";
import type { User } from "../models/user";
import type { Turn } from "../models/turn";
import { Game } from "../models/game";

export type SocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  User
>;

interface GameConnection {
  socketId: string;
  userId: string;
}

interface ClientToServerEvents {
  joinGame: (
    roomId: string,
    ack: Acknowledgement<{ game: Game; connections: GameConnection[] }>
  ) => Promise<void>;
  leaveGame: (roomId: string) => Promise<void>;
  startGame: (
    roomId: string,
    ack: Acknowledgement<{ game: Game }>
  ) => Promise<void>;
  sendMove: (
    roomId: string,
    turn: Turn,
    boardHash: string,
    ack: Acknowledgement
  ) => Promise<void>;
}

interface ServerToClientEvents {
  playerJoined: (connection: GameConnection) => void;
  gameStarting: () => void;
  gameStarted: (game: Game) => void;
  opponentMove: (turn: Turn, boardHash: string) => void;
  playerLeft: (connection: GameConnection) => void;
}

interface AcknowledgementSuccessPayload<Data = any> {
  status: "success";
  data?: Data;
}

interface AcknowledgementErrorPayload {
  status: "error";
  error: string;
}

export type Acknowledgement<AckData = any> = (
  payload: AcknowledgementSuccessPayload<AckData> | AcknowledgementErrorPayload
) => void;
