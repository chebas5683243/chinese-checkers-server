import type { DefaultEventsMap, Server } from "socket.io";
import type { User } from "../models/user";
import type { Turn } from "../models/turn";

export type SocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  User
>;

interface ClientToServerEvents {
  joinGame: (roomId: string, ack: Acknowledgement) => Promise<void>;
  leaveGame: (roomId: string) => Promise<void>;
  startGame: (roomId: string, ack: Acknowledgement) => Promise<void>;
  sendMove: (
    roomId: string,
    turn: Turn,
    boardHash: string,
    ack: Acknowledgement
  ) => Promise<void>;
}

interface ServerToClientEvents {
  playerJoined: (payload: { userId: string }) => void;
  gameStarting: () => void;
  gameStarted: () => void;
  opponentMove: (payload: { turn: Turn; boardHash: string }) => void;
  playerLeft: (payload: { userId: string }) => void;
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
