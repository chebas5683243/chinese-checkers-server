import type { Hono } from "hono";
import * as service from "./service";
import { getUserIdFromCookie } from "./utils";

export function setupRestAPIs(app: Hono) {
  app.get("/", (c) => {
    return c.text("Server is running");
  });

  app.post("/game", async (c) => {
    const userId = getUserIdFromCookie(c);

    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const gameId = await service.createGame(userId);
    return c.json({ gameId }, 201);
  });
}
