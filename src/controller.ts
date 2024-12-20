import type { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { cors } from "hono/cors";
import * as service from "./service";
import { getUserIdFromCookie } from "./utils";

export function setupRestAPIs(app: Hono) {
  app.use("*", async (c, next) => {
    const corsMiddlewareHandler = cors({
      origin: "http://localhost:3000",
      credentials: true,
    });

    return corsMiddlewareHandler(c, next);
  });

  app.get("/", (c) => {
    const userId = getUserIdFromCookie(c);

    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

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
