import { GameStatus } from "./models/game";
import { User } from "./models/user";
import { repository } from "./repository";

async function createGame(createdBy: string) {
  const gameId = await repository.createGame(createdBy);
  return gameId;
}

async function findGame(gameId: string) {
  const game = await repository.findGame(gameId);
  return game;
}

async function startGame(roomId: string, players: User[], userId: string) {
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
  });

  await repository.addGamePlayers(roomId, players);
}

async function initializeGame(gameId: string, userId: string) {
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

export const service = {
  createGame,
  findGame,
  startGame,
  initializeGame,
};
