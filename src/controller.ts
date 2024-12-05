import type { Hono } from "hono";
import * as service from "./service";
import { getUserIdFromCookie } from "./utils";
import { getCookie, setCookie } from "hono/cookie";
import { cors } from "hono/cors";

export function setupRestAPIs(app: Hono) {
  app.use("*", async (c, next) => {
    const corsMiddlewareHandler = cors({
      origin: "http://localhost:3000",
      credentials: true,
    });

    console.log("cookies", getCookie(c));

    return corsMiddlewareHandler(c, next);
  });

  app.get("/", (c) => {
    setCookie(c, "delicious_cookie", "macha");
    return c.text("Server is running");
  });

  app.post("/game", async (c) => {
    console.log(getCookie(c));
    const userId = getUserIdFromCookie(c);

    console.log(c);

    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const gameId = await service.createGame(userId);
    return c.json({ gameId }, 201);
  });
}
