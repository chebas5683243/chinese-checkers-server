import type { Board } from "./board";
import type { Group } from "./group";
import type { Player } from "./player";
import type { Turn } from "./turn";

export type Game = NotStartedGame | StartedGame;

export interface NotStartedGame extends GameConfig {
  status: GameStatus.LOBBY | GameStatus.STARTING;
}

export interface StartedGame extends GameConfig {
  status: GameStatus.IN_PROGRESS | GameStatus.FINISHED;
  result: string[];
  players: Player[];
  turns: Turn[];
  board: Board;
}

interface GameConfig {
  id: string;
  name: string;
  nPlayers: number;
  type: GameType;
  mode: GameMode;
  spped: GameSpeed;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  groupOrder: Group[];
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
