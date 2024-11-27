import { initializeBoard } from "./helpers/board";
import { GameStatus } from "./models/game";
import { Turn } from "./models/turn";
import { User } from "./models/user";
import * as repository from "./repository";

export async function createGame(createdBy: string) {
  const gameId = await repository.createGame(createdBy);
  return gameId;
}

export async function findGame(gameId: string) {
  const game = await repository.findGame(gameId);
  return game;
}

export async function startGame(
  roomId: string,
  players: User[],
  userId: string
) {
  const game = await repository.findGame(roomId);

  if (game.createdBy !== userId) {
    throw new Error("Not the game creator");
  }

  if (game.gameStatus !== GameStatus.STARTING) {
    throw new Error("Game already started");
  }

  await repository.updateGame({
    id: roomId,
    gameStatus: GameStatus.IN_PROGRESS,
    turns: [],
    board: initializeBoard([1, 4]),
    groupOrder: [1, 4],
  });

  await repository.addGamePlayers(roomId, players);
}

export async function initializeGame(gameId: string, userId: string) {
  const game = await repository.findGame(gameId);

  if (game.createdBy !== userId) {
    throw new Error("Not the game creator");
  }

  if (game.gameStatus !== GameStatus.LOBBY) {
    throw new Error("Game already started");
  }

  await repository.updateGame({
    id: gameId,
    gameStatus: GameStatus.STARTING,
  });
}

export async function saveMove(
  gameId: string,
  turn: Turn,
  userId: string,
  boardHash: string
) {
  const game = await repository.findGame(gameId);

  if (game.gameStatus !== GameStatus.IN_PROGRESS) {
    throw new Error("Game not in progress");
  }

  const currentPlayer =
    game.groupOrder[game.turns.length % game.groupOrder.length];

  const newTurns = game.turns ? [...game.turns, turn] : [turn];

  await repository.updateGame({
    id: gameId,
    turns: newTurns,
  });
}

export async function deleteGame(gameId: string) {}
