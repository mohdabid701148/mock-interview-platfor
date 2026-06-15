import { Room } from "../models/room.model.js";

const activeRooms = new Map(); // Map<roomId, Map<userId, { userId, username, email, socketIds: Set<socketId> }>>

const getRoomUsers = (roomId) => {
  const room = activeRooms.get(roomId);

  if (!room) {
    return [];
  }

  return Array.from(room.values()).map((user) => ({
    userId: user.userId,
    username: user.username,
    email: user.email,
  }));
};

const addUserToRoom = (roomId, user, socketId) => {
  if (!activeRooms.has(roomId)) {
    activeRooms.set(roomId, new Map());
  }

  const room = activeRooms.get(roomId);
  const userId = user._id.toString();

  if (!room.has(userId)) {
    room.set(userId, {
      userId,
      username: user.username,
      email: user.email,
      socketIds: new Set(),
    });
  }

  room.get(userId).socketIds.add(socketId);
};

const removeUserFromRoom = (roomId, userId, socketId) => {
  const room = activeRooms.get(roomId);

  if (!room) {
    return;
  }

  const userEntry = room.get(userId);
  if (userEntry) {
    userEntry.socketIds.delete(socketId);
    if (userEntry.socketIds.size === 0) {
      room.delete(userId);
    }
  }

  if (room.size === 0) {
    activeRooms.delete(roomId);
  }
};

export const registerRoomSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-room", ({ roomId }) => {
      if (!roomId) {
        socket.emit("socket-error", {
          message: "Room id is required",
        });
        return;
      }

      const userId = socket.user._id.toString();
      const roomUsersMap = activeRooms.get(roomId);
      const wasAlreadyInRoom = roomUsersMap && roomUsersMap.has(userId);

      console.log(`${socket.user.username} joined room ${roomId}`);

      socket.join(roomId);
      socket.currentRoomId = roomId;

      addUserToRoom(roomId, socket.user, socket.id);

      if (!wasAlreadyInRoom) {
        socket.to(roomId).emit("user-joined", {
          userId,
          username: socket.user.username,
          email: socket.user.email,
        });
      }

      io.to(roomId).emit("room-users", getRoomUsers(roomId));
    });

    socket.on("leave-room", ({ roomId }) => {
      if (!roomId) {
        return;
      }

      console.log(`${socket.user.username} left room ${roomId}`);

      socket.leave(roomId);

      const userId = socket.user._id.toString();
      removeUserFromRoom(roomId, userId, socket.id);

      const roomUsersMap = activeRooms.get(roomId);
      const isStillInRoom = roomUsersMap && roomUsersMap.has(userId);

      if (!isStillInRoom) {
        socket.to(roomId).emit("user-left", {
          userId,
          username: socket.user.username,
          email: socket.user.email,
        });
      }

      io.to(roomId).emit("room-users", getRoomUsers(roomId));

      socket.currentRoomId = null;
    });

    socket.on("question-attached", async ({ roomId, questionData }) => {
      try {
        if (!roomId || !questionData) {
          return socket.emit("socket-error", { message: "Room ID and Question Data are required" });
        }

        const room = await Room.findById(roomId);
        if (!room) {
          return socket.emit("socket-error", { message: "Room not found" });
        }

        // Authorization check
        if (room.interviewer.toString() !== socket.user._id.toString()) {
          return socket.emit("socket-error", { message: "Only the interviewer can attach a question" });
        }

        // Status check
        if (room.status === "completed" || room.status === "cancelled") {
          return socket.emit("socket-error", { message: "Cannot attach a question to a completed or cancelled room" });
        }

        // Update DB
        room.attachedQuestion = {
          source: questionData.source || null,
          title: questionData.title || "Untitled Question",
          difficulty: questionData.difficulty || "N/A",
          url: questionData.url || "",
          description: questionData.description || "",
          tags: questionData.tags || [],
          attachedBy: socket.user._id,
          attachedAt: new Date()
        };

        await room.save();

        // Broadcast to everyone in the room
        io.to(roomId).emit("question-updated", { attachedQuestion: room.attachedQuestion });

      } catch (error) {
        console.error("Error in question-attached event:", error);
        socket.emit("socket-error", { message: "Failed to attach question" });
      }
    });

    socket.on("disconnect", () => {
      const roomId = socket.currentRoomId;

      if (!roomId) {
        return;
      }

      console.log(`${socket.user.username} disconnected from room ${roomId}`);

      const userId = socket.user._id.toString();
      removeUserFromRoom(roomId, userId, socket.id);

      const roomUsersMap = activeRooms.get(roomId);
      const isStillInRoom = roomUsersMap && roomUsersMap.has(userId);

      if (!isStillInRoom) {
        socket.to(roomId).emit("user-left", {
          userId,
          username: socket.user.username,
          email: socket.user.email,
        });
      }

      io.to(roomId).emit("room-users", getRoomUsers(roomId));
    });
  });
};