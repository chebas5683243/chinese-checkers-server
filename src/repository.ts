import crypto from "node:crypto";
import {
  Game,
  GameMode,
  GameSpeed,
  GameStatus,
  GameType,
  StartedGame,
} from "./models/game";
import { User } from "./models/user";
import { PartialWithId } from "./types/utility";

const games = new Map<string, Game>();

function getUUID() {
  return crypto.randomUUID() as string;
}

export async function createGame(createdBy: string) {
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

export async function findGame(gameId: string) {
  const game = games.get(gameId);

  if (!game) {
    throw new Error("Game not found");
  }

  return game;
}

export async function deleteGame(gameId: string) {
  games.delete(gameId);
}

export async function updateGame(updatedGame: PartialWithId<Game>) {
  const game = games.get(updatedGame.id);

  if (!game) {
    throw new Error("Game not found");
  }

  const newGame = {
    ...game,
    ...updatedGame,
    updatedAt: Date.now(),
  } as Game;

  games.set(game.id, newGame);
}

export async function addGamePlayers(gameId: string, players: User[]) {
  const game = games.get(gameId) as StartedGame | undefined;

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

export async function addPlayerTurn(gameId: string) {
  const game = games.get(gameId) as StartedGame | undefined;

  if (!game) {
    throw new Error("Game not found");
  }

  game.turns = [
    ...game.turns,
    {
      id: getUUID(),
      gameId,
      createdAt: Date.now(),
      from: { q: 0, r: 0 },
      moves: [],
      order: game.turns.length + 1,
    },
  ];
  game.updatedAt = Date.now();
}
