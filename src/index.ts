import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { setupRestAPIs } from "./controllers/index.js";
import { setupSocketListeners } from "./listeners/index.js";

const app = new Hono();

const port = 4174;

const httpServer = serve({
  fetch: app.fetch,
  port,
});

console.log(`Server is running on http://localhost:${port}`);

setupRestAPIs(app);

setupSocketListeners(httpServer);
