import { Board } from "./board";
import { Group } from "./group";
import { Player } from "./player";
import { Turn } from "./turn";

export interface Game {
  id: string;
  name: string;
  nPlayers: number;
  gameType: GameType;
  gameMode: GameMode;
  gameSpeed: GameSpeed;
  gameStatus: GameStatus;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  groupOrder: Group[];
  result?: string[];
  players?: Player[];
  turns?: Turn[];
  board?: Board;
}

export enum GameType {
  SINGLE_PLAYER = "SINGLE_PLAYER",
  MULTI_PLAYER = "MULTI_PLAYER",
}

export enum GameMode {
  CLASSIC = "CLASSIC",
  DUEL = "DUEL",
  BATTLE = "BATTLE",
}

export enum GameSpeed {
  RUSH = "RUSH",
  NORMAL = "NORMAL",
}

export enum GameStatus {
  LOBBY = "LOBBY",
  STARTING = "STARTING",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}
