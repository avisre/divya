import { io, type Socket } from "socket.io-client";
import { SOCKET_BASE_URL } from "@/lib/api";
import { getStoredSession } from "@/lib/session-store";

let socket: Socket | null = null;

export function getSharedPrayerSocket() {
  const session = getStoredSession();
  if (!socket) {
    socket = io(SOCKET_BASE_URL, {
      auth: {
        token: session?.token
      },
      transports: ["websocket"]
    });
  } else if (session?.token) {
    socket.auth = { token: session.token };
    socket.connect();
  }
  return socket;
}

export function disconnectSharedPrayerSocket() {
  socket?.disconnect();
  socket = null;
}
