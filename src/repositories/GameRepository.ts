import crypto from "node:crypto";

const games = new Map();

export function createGame() {
  const gameId = crypto.randomUUID();

  games.set(gameId, {
    players: [],
  });

  return gameId;
}

export function findGame(gameId: string) {
  return games.get(gameId);
}

export function deleteGame(gameId: string) {
  games.delete(gameId);
}
