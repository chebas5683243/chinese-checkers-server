import { Board } from "./models/board";
import {
  Game,
  GameMode,
  GameSpeed,
  GameStatus,
  GameType,
  StartedGame,
} from "./models/game";
import { Turn } from "./models/turn";
import { User } from "./models/user";
import { PartialWithId } from "./types/utility";
import { getUUID } from "./utils/random";

const games = new Map<string, Game>();

export async function createGame(createdBy: string) {
  const gameId = getUUID();

  games.set(gameId, {
    id: gameId,
    createdBy,
    createdAt: Date.now(),
    mode: GameMode.CLASSIC,
    speed: GameSpeed.NORMAL,
    status: GameStatus.LOBBY,
    type: GameType.MULTI_PLAYER,
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

  return structuredClone(game);
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

  return structuredClone(game);
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

  return structuredClone(game);
}

export async function addPlayerTurn(turn: Turn) {
  const game = games.get(turn.gameId) as StartedGame | undefined;

  if (!game) {
    throw new Error("Game not found");
  }

  game.turns = [
    ...game.turns,
    {
      id: getUUID(),
      gameId: turn.gameId,
      createdAt: Date.now(),
      from: { q: 0, r: 0 },
      moves: [],
      order: game.turns.length + 1,
    },
  ];
  game.updatedAt = Date.now();
}

export async function updateGameBoard(gameId: string, board: Board) {
  const game = games.get(gameId) as StartedGame | undefined;

  if (!game) {
    throw new Error("Game not found");
  }

  game.board = board;
  game.updatedAt = Date.now();
}
