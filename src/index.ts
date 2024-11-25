import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { setupRestAPIs } from "./controller";
import { setupSocketListeners } from "./listeners";

const app = new Hono();

const port = 4174;

const httpServer = serve({
  fetch: app.fetch,
  port,
});

console.log(`Server is running on http://localhost:${port}`);

setupRestAPIs(app);

setupSocketListeners(httpServer);
