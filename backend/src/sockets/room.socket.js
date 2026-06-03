const activeRooms = new Map();

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

  room.set(user._id.toString(), {
    userId: user._id.toString(),
    username: user.username,
    email: user.email,
    socketId,
  });
};

const removeUserFromRoom = (roomId, userId) => {
  const room = activeRooms.get(roomId);

  if (!room) {
    return;
  }

  room.delete(userId);

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

      console.log(`${socket.user.username} joined room ${roomId}`);

      socket.join(roomId);
      socket.currentRoomId = roomId;

      addUserToRoom(roomId, socket.user, socket.id);

      socket.to(roomId).emit("user-joined", {
        userId: socket.user._id.toString(),
        username: socket.user.username,
        email: socket.user.email,
      });

      io.to(roomId).emit("room-users", getRoomUsers(roomId));
    });

    socket.on("leave-room", ({ roomId }) => {
      if (!roomId) {
        return;
      }

      console.log(`${socket.user.username} left room ${roomId}`);

      socket.leave(roomId);

      removeUserFromRoom(roomId, socket.user._id.toString());

      socket.to(roomId).emit("user-left", {
        userId: socket.user._id.toString(),
        username: socket.user.username,
        email: socket.user.email,
      });

      io.to(roomId).emit("room-users", getRoomUsers(roomId));

      socket.currentRoomId = null;
    });

    socket.on("disconnect", () => {
      const roomId = socket.currentRoomId;

      if (!roomId) {
        return;
      }

      console.log(`${socket.user.username} disconnected from room ${roomId}`);

      removeUserFromRoom(roomId, socket.user._id.toString());

      socket.to(roomId).emit("user-left", {
        userId: socket.user._id.toString(),
        username: socket.user.username,
        email: socket.user.email,
      });

      io.to(roomId).emit("room-users", getRoomUsers(roomId));
    });
  });
};