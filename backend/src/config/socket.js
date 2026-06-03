import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import {User} from "../models/User.model.js";
import { registerRoomSocketHandlers } from "../sockets/room.socket.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      console.log("Socket token received:", !!token);

      if (!token) {
        return next(new Error("Unauthorized socket connection"));
      }

      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const userId = decodedToken?._id || decodedToken?.id;

      const user = await User.findById(userId).select("-password -refreshToken");

      if (!user) {
        return next(new Error("Invalid socket token"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Socket authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket user connected:", socket.user.username, socket.id);
  });

  registerRoomSocketHandlers(io);

  return io;
};