import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { registerRoomSocketHandlers } from "../sockets/room.socket.js";
import { registerEditorSocketHandlers } from "../sockets/editor.socket.js";

const getAllowedOrigins = () => {
  const origins = process.env.CORS_ORIGIN || "http://localhost:5173";

  return origins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: getAllowedOrigins(),
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token || token === "undefined" || token === "null") {
        return next(new Error("Unauthorized socket connection"));
      }

      if (!process.env.ACCESS_TOKEN_SECRET) {
        return next(new Error("Socket auth secret missing"));
      }

      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const userId = decodedToken?._id || decodedToken?.id;

      if (!userId) {
        return next(new Error("Invalid socket token payload"));
      }

      const user = await User.findById(userId).select(
        "-password -refreshToken"
      );

      if (!user) {
        return next(new Error("Socket user not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.log("Socket auth error:", error.message);
      next(new Error("Socket authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", {
      socketId: socket.id,
      userId: socket.user?._id?.toString(),
      username: socket.user?.username,
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", {
        socketId: socket.id,
        reason,
      });
    });
  });

  registerRoomSocketHandlers(io);
  registerEditorSocketHandlers(io);

  return io;
};