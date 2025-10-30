// lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket || !socket.connected) {
    console.log("🔌 Creating new socket connection...");
    
    socket = io({
      path: "/api/socket",
      addTrailingSlash: false,
      // Use polling instead of websocket for Next.js development
      transports: ["polling"], // Changed from ["websocket", "polling"]
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected. Reason:", reason);
      // Auto-reconnect if server disconnects
      if (reason === "io server disconnect") {
        socket?.connect();
      }
    });

    socket.on("connect_error", (error) => {
      console.error("🔴 Connection error:", error.message);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Reconnected after", attemptNumber, "attempts");
    });

    socket.on("reconnect_error", (error) => {
      console.error("🔴 Reconnection error:", error.message);
    });

    socket.on("reconnect_failed", () => {
      console.error("🔴 Reconnection failed");
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Manually disconnecting socket...");
    socket.disconnect();
    socket = null;
  }
};
