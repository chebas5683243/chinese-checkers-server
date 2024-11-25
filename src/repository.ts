import crypto from "node:crypto";
import { Game, GameMode, GameSpeed, GameStatus, GameType } from "./models/game";
import { User } from "./models/user";
import { PartialWithId } from "./types/utility";

const games = new Map<string, Game>();

function getUUID() {
  return crypto.randomUUID() as string;
}

async function createGame(createdBy: string) {
  const gameId = getUUID();

  games.set(gameId, {
    id: gameId,
    createdBy,
    createdAt: Date.now(),
    gameMode: GameMode.CLASSIC,
    gameSpeed: GameSpeed.NORMAL,
    gameStatus: GameStatus.LOBBY,
    gameType: GameType.MULTI_PLAYER,
    groupOrder: [],
    name: "New Game",
    nPlayers: 2,
    updatedAt: Date.now(),
  });

  return gameId;
}

async function findGame(gameId: string) {
  const game = games.get(gameId);

  if (!game) {
    throw new Error("Game not found");
  }

  return game;
}

async function deleteGame(gameId: string) {
  games.delete(gameId);
}

async function updateGame(updatedGame: PartialWithId<Game>) {
  const game = games.get(updatedGame.id);

  if (!game) {
    throw new Error("Game not found");
  }

  const newGame: Game = {
    ...game,
    ...updatedGame,
    updatedAt: Date.now(),
  };

  games.set(game.id, newGame);
}

async function addGamePlayers(gameId: string, players: User[]) {
  const game = games.get(gameId);

  if (!game) {
    throw new Error("Game not found");
  }

  game.players = players.map((user) => ({
    id: getUUID(),
    gameId,
    userId: user.userId,
    groups: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));
  game.updatedAt = Date.now();
}

export const repository = {
  createGame,
  findGame,
  deleteGame,
  updateGame,
  addGamePlayers,
};
