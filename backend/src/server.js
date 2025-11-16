import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();
const PORT = ENV.PORT || 3000;

// -----------------------------------------------------------------------------
// MIDDLEWARE
// -----------------------------------------------------------------------------
app.use(express.json({ limit: "5mb" }));

// CORS for API + Socket.io
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://chat-web-app-seven-hazel.vercel.app",
      "https://chat-webapp-j6hm.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// still ok to keep but not used for jwt auth anymore
app.use(cookieParser());

// -----------------------------------------------------------------------------
// ROUTES
// -----------------------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// -----------------------------------------------------------------------------
// PRODUCTION FRONTEND (Vercel / Render deployment)
// -----------------------------------------------------------------------------
if (ENV.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  app.get("*", (_, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// -----------------------------------------------------------------------------
// START SERVER
// -----------------------------------------------------------------------------
server.listen(PORT, () => {
  console.log("Server running on port:", PORT);
  connectDB();
});
