import type { DefaultEventsMap, Server, Socket } from "socket.io";

export function gameListeners(
  io: Server,
  socket: Socket<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    { userId: string; username: string }
  >
) {
  socket.on("joinGame", (gameId) => {
    socket.join(gameId);
  });
}
