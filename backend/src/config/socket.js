import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { registerRoomSocketHandlers } from "../sockets/room.socket.js";
import { registerEditorSocketHandlers } from "../sockets/editor.socket.js";
import { getAllowedOrigins } from "./allowedOrigins.js";

const userSocketRegistry = new Map(); // Map<userIdString, Set<socketIdString>>
let ioInstance = null;

export const getSocketsByUserId = (userId) => {
  if (!userId) return new Set();
  return userSocketRegistry.get(userId.toString()) || new Set();
};

export const emitToUser = (userId, eventName, data) => {
  if (!ioInstance || !userId) return;
  const socketIds = getSocketsByUserId(userId);
  socketIds.forEach((socketId) => {
    ioInstance.to(socketId).emit(eventName, data);
  });
};

// Emit an event to all participants of a room (interviewer + interviewee)
// Works across all pages — uses userSocketRegistry, not Socket.IO rooms
export const emitToRoom = (room, eventName, data) => {
  if (!room) return;
  const userIds = new Set();

  const interviewerId =
    room.interviewer?._id?.toString() || room.interviewer?.toString();
  const intervieweeId =
    room.interviewee?._id?.toString() || room.interviewee?.toString();

  if (interviewerId) userIds.add(interviewerId);
  if (intervieweeId) userIds.add(intervieweeId);

  userIds.forEach((uid) => emitToUser(uid, eventName, data));
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

  ioInstance = io;

  io.on("connection", (socket) => {
    const userId = socket.user?._id?.toString();
    if (userId) {
      if (!userSocketRegistry.has(userId)) {
        userSocketRegistry.set(userId, new Set());
      }
      userSocketRegistry.get(userId).add(socket.id);
    }

    socket.on("disconnect", () => {
      if (userId && userSocketRegistry.has(userId)) {
        userSocketRegistry.get(userId).delete(socket.id);
        if (userSocketRegistry.get(userId).size === 0) {
          userSocketRegistry.delete(userId);
        }
      }
    });
  });

  registerRoomSocketHandlers(io);
  registerEditorSocketHandlers(io);

  return io;
};