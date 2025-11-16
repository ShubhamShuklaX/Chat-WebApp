import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    // Get token from frontend socket handshake
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.log("❌ Socket rejected: No token provided");
      return next(new Error("Unauthorized - No Token Provided"));
    }

    // Verify JWT
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded) {
      console.log("❌ Socket rejected: Invalid token");
      return next(new Error("Unauthorized - Invalid Token"));
    }

    // Find user in DB
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("❌ Socket rejected: User not found");
      return next(new Error("User not found"));
    }

    // Attach user to socket
    socket.user = user;
    socket.userId = user._id.toString();

    console.log(`🔐 Socket authenticated: ${user.fullName}`);

    next();
  } catch (error) {
    console.log("❌ Error in socket authentication:", error.message);
    next(new Error("Unauthorized - Authentication Failed"));
  }
};
