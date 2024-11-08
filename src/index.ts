import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";

const app = new Hono()

const port = 4174

const httpServer = serve({
  fetch: app.fetch,
  port,
});

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

console.log(`Server is running on http://localhost:${port}`)

const io = new Server(httpServer as HTTPServer, {
  /* options */
});

io.on("connection", (socket) => {
  console.log(socket)
});
