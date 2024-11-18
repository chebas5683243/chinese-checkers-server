import type { Hono } from "hono";

export function createGame(app: Hono) {
  app.post("/game", () => {});
}
