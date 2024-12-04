import { hashBoard, initializeBoard } from "./helpers/board";
import { validateMoves } from "./helpers/turn";
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

  if (game.status !== GameStatus.STARTING) {
    throw new Error("Game already started");
  }

  await repository.updateGame({
    id: roomId,
    status: GameStatus.IN_PROGRESS,
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

  if (game.status !== GameStatus.LOBBY) {
    throw new Error("Game already started");
  }

  await repository.updateGame({
    id: gameId,
    status: GameStatus.STARTING,
  });
}

export async function saveMoves(
  gameId: string,
  turn: Turn,
  userId: string,
  boardHash: string
) {
  const game = await repository.findGame(gameId);

  if (game.status !== GameStatus.IN_PROGRESS) {
    throw new Error("Game not in progress");
  }

  const player = game.players.find((player) => player.userId === userId);

  if (!player) {
    throw new Error("Player not in the game");
  }

  const currentGroup =
    game.groupOrder[game.turns.length % game.groupOrder.length];

  if (!player.groups.includes(currentGroup)) {
    throw new Error("Not player's turn");
  }

  const newBoard = validateMoves(game.board, turn, currentGroup);

  if (boardHash !== hashBoard(newBoard)) {
    throw new Error("Invalid board hash");
  }

  const newTurns = game.turns ? [...game.turns, turn] : [turn];

  await repository.updateGame({
    id: gameId,
    turns: newTurns,
    board: newBoard,
  });
}

export async function deleteGame(gameId: string) {}
