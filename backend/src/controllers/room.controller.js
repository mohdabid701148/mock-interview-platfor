import { Room } from "../models/room.model.js";
import { generateRoomCode } from "../utils/generateRoomCode.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// CREATE ROOM
export const createRoom = asyncHandler(async (req, res) => {
  const {
    title,
    language = "JavaScript",
    maxParticipants = 5,
  } = req.body;

  if (!title) {
    throw new ApiError(400, "Room title is required");
  }

  let roomCode;
  let existingRoom;

  do {
    roomCode = generateRoomCode();

    existingRoom = await Room.findOne({ roomCode });
  } while (existingRoom);

  const room = await Room.create({
    roomCode,
    title,
    createdBy: req.user._id,
    participants: [req.user._id],
    language,
    maxParticipants,
  });

  const createdRoom = await Room.findById(room._id)
    .populate("createdBy", "username email")
    .populate("participants", "username email");

  return res.status(201).json(
    new ApiResponse(
      201,
      createdRoom,
      "Room created successfully"
    )
  );
});


// JOIN ROOM
export const joinRoom = asyncHandler(async (req, res) => {
  const { roomCode } = req.body;

  if (!roomCode) {
    throw new ApiError(400, "Room code is required");
  }

  const room = await Room.findOne({
    roomCode: roomCode.toUpperCase(),
  });

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  const alreadyJoined = room.participants.some(
    (participant) =>
      participant.toString() === req.user._id.toString()
  );

  if (alreadyJoined) {
    throw new ApiError(400, "You already joined this room");
  }

  if (room.participants.length >= room.maxParticipants) {
    throw new ApiError(400, "Room is full");
  }

  room.participants.push(req.user._id);

  await room.save();

  const updatedRoom = await Room.findById(room._id)
    .populate("createdBy", "username email")
    .populate("participants", "username email");

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedRoom,
      "Joined room successfully"
    )
  );
});


// LEAVE ROOM
export const leaveRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId);

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  room.participants = room.participants.filter(
    (participant) =>
      participant.toString() !== req.user._id.toString()
  );

  if (room.participants.length === 0) {
    await room.deleteOne();

    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "Room deleted because no participants left"
      )
    );
  }

  await room.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Left room successfully"
    )
  );
});


// GET ROOM DETAILS
export const getRoomDetails = asyncHandler(async (req, res) => {
  const { roomCode } = req.params;

  const room = await Room.findOne({
    roomCode: roomCode.toUpperCase(),
  })
    .populate("createdBy", "username email")
    .populate("participants", "username email");

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      room,
      "Room fetched successfully"
    )
  );
});


// GET USER ROOMS
export const getUserRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({
  participants: req.user._id,
  status: { $ne: "completed" },
})
    .populate("createdBy", "username email")
    .populate("participants", "username email")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      rooms,
      "User rooms fetched successfully"
    )
  );
});

// START INTERVIEW
export const startRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId);

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  const isParticipant = room.participants.some(
    (participant) =>
      participant.toString() === req.user._id.toString()
  );

  if (!isParticipant) {
    throw new ApiError(403, "You are not a participant of this room");
  }

  if (room.status === "active") {
    throw new ApiError(400, "Interview is already active");
  }

  if (room.status === "completed") {
    throw new ApiError(400, "Completed interview cannot be started again");
  }

  room.status = "active";

  await room.save();

  const updatedRoom = await Room.findById(room._id)
    .populate("createdBy", "username email")
    .populate("participants", "username email");

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedRoom,
      "Interview started successfully"
    )
  );
});


// COMPLETE INTERVIEW
export const completeRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId);

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  const isParticipant = room.participants.some(
    (participant) =>
      participant.toString() === req.user._id.toString()
  );

  if (!isParticipant) {
    throw new ApiError(403, "You are not a participant of this room");
  }

  if (room.status !== "active") {
    throw new ApiError(400, "Only active interview can be completed");
  }

  room.status = "completed";

  await room.save();

  const updatedRoom = await Room.findById(room._id)
    .populate("createdBy", "username email")
    .populate("participants", "username email");

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedRoom,
      "Interview completed successfully"
    )
  );
});