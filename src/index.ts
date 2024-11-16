import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Server } from "socket.io";

const app = new Hono();

const port = 4174;

const httpServer = serve({
  fetch: app.fetch,
  port,
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

console.log(`Server is running on http://localhost:${port}`);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("nConnections", io.sockets.sockets.size);

  console.log("connected", socket.id);

  socket.on("disconnect", (reason) => {
    console.log("disconnected", socket.id, reason);
  });
});
