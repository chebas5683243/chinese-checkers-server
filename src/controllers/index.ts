import type { Hono } from "hono";

export function setupRestAPIs(app: Hono) {
  app.get("/", (c) => {
    return c.text("Server is running");
  });
}
