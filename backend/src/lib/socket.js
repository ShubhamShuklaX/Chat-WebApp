import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

export const app = express();
export const server = http.createServer(app);

// SOCKET.IO SERVER with proper CORS
export const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://chat-web-app-seven-hazel.vercel.app",
      "https://chat-webapp-j6hm.onrender.com",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
    credentials: true,
  },
});

// Authenticate every socket connection with JWT
io.use(socketAuthMiddleware);

// Store online users
const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  // socket.user + socket.userId is set inside your socketAuthMiddleware
  const displayName = socket.user?.fullName || "Unknown User";
  const userId = socket.userId;

  console.log("🔌 Socket connected:", displayName);

  // Register the socket
  userSocketMap[userId] = socket.id;

  // Notify all users about online list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", displayName);

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
