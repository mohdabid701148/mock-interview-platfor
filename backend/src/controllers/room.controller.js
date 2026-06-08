import { Room } from "../models/room.model.js";
import { Schedule } from "../models/Schedule.model.js";
import { generateRoomCode } from "../utils/generateRoomCode.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const populateRoom = async (roomId) => {
  return await Room.findById(roomId)
    .populate("createdBy", "username email fullName")
    .populate("interviewer", "username email fullName")
    .populate("interviewee", "username email fullName")
    .populate("participants.user", "username email fullName");
};

const isRoomParticipant = (room, userId) => {
  return room.participants.some(
    (participant) =>
      participant.user.toString() === userId.toString()
  );
};

export const createRoom = asyncHandler(async (req, res) => {
  const {
    title,
    language = "javascript",
    meetingLink = "",
  } = req.body;

  if (!title?.trim()) {
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
    interviewer: req.user._id,
    interviewee: null,
    participants: [
      {
        user: req.user._id,
        role: "interviewer",
      },
    ],
    language,
    meetingLink,
    maxParticipants: 2,
  });

  const createdRoom = await populateRoom(room._id);

  return res.status(201).json(
    new ApiResponse(
      201,
      createdRoom,
      "Interview room created successfully"
    )
  );
});

export const joinRoom = asyncHandler(async (req, res) => {
  const { roomCode } = req.body;

  if (!roomCode?.trim()) {
    throw new ApiError(400, "Room code is required");
  }

  const room = await Room.findOne({
    roomCode: roomCode.toUpperCase(),
  });

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (room.status === "completed") {
    throw new ApiError(400, "This interview is already completed");
  }

  if (room.status === "cancelled") {
    throw new ApiError(400, "This interview is cancelled");
  }

  if (room.status === "active") {
    throw new ApiError(400, "This interview has already started");
  }

  const alreadyJoined = isRoomParticipant(room, req.user._id);

  if (alreadyJoined) {
    throw new ApiError(400, "You already joined this room");
  }

  if (room.interviewer.toString() === req.user._id.toString()) {
    throw new ApiError(400, "Interviewer cannot join as interviewee");
  }

  if (room.interviewee) {
    throw new ApiError(400, "This room already has an interviewee");
  }

  if (room.participants.length >= 2) {
    throw new ApiError(400, "Room is full");
  }

  room.interviewee = req.user._id;

  room.participants.push({
    user: req.user._id,
    role: "interviewee",
  });

  await room.save();

  const updatedRoom = await populateRoom(room._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedRoom,
      "Joined interview room successfully"
    )
  );
});

export const leaveRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId);

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (!isRoomParticipant(room, req.user._id)) {
    throw new ApiError(403, "You are not a participant of this room");
  }

  if (room.status === "completed") {
    throw new ApiError(400, "Completed interview cannot be left");
  }

  if (room.status === "active") {
    throw new ApiError(
      400,
      "Active interview cannot be left. End the interview first"
    );
  }

  const isInterviewer =
    room.interviewer.toString() === req.user._id.toString();

  const isInterviewee =
    room.interviewee &&
    room.interviewee.toString() === req.user._id.toString();

  if (isInterviewer) {
    room.status = "cancelled";

    await room.save();

    await Schedule.findOneAndUpdate(
      {
        room: room._id,
        status: "scheduled",
      },
      {
        status: "cancelled",
      }
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {},
        "Interview cancelled because interviewer left"
      )
    );
  }

  room.participants = room.participants.filter(
    (participant) =>
      participant.user.toString() !== req.user._id.toString()
  );

  if (isInterviewee) {
    room.interviewee = null;

    await Schedule.findOneAndUpdate(
      {
        room: room._id,
        status: "scheduled",
      },
      {
        status: "cancelled",
      }
    );

    if (room.status === "scheduled") {
      room.status = "waiting";
    }
  }

  await room.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Left interview room successfully"
    )
  );
});

export const getRoomDetails = asyncHandler(async (req, res) => {
  const { roomCode } = req.params;

  const room = await Room.findOne({
    roomCode: roomCode.toUpperCase(),
  })
    .populate("createdBy", "username email fullName")
    .populate("interviewer", "username email fullName")
    .populate("interviewee", "username email fullName")
    .populate("participants.user", "username email fullName");

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  const isParticipant = room.participants.some(
    (participant) =>
      participant.user._id.toString() === req.user._id.toString()
  );

  if (!isParticipant) {
    throw new ApiError(403, "You are not a participant of this room");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      room,
      "Room fetched successfully"
    )
  );
});

export const getUserRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({
    "participants.user": req.user._id,
    status: { $nin: ["completed", "cancelled"] },
  })
    .populate("createdBy", "username email fullName")
    .populate("interviewer", "username email fullName")
    .populate("interviewee", "username email fullName")
    .populate("participants.user", "username email fullName")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      rooms,
      "User rooms fetched successfully"
    )
  );
});

export const startRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId);

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (room.interviewer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only interviewer can start the interview");
  }

  if (!room.interviewee) {
    throw new ApiError(400, "Interviewee has not joined yet");
  }

  if (room.status === "active") {
    throw new ApiError(400, "Interview is already active");
  }

  if (room.status === "completed") {
    throw new ApiError(400, "Completed interview cannot be started again");
  }

  if (room.status === "cancelled") {
    throw new ApiError(400, "Cancelled interview cannot be started");
  }

  room.status = "active";
  room.startedAt = room.startedAt || new Date();

  await room.save();

  const updatedRoom = await populateRoom(room._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedRoom,
      "Interview started successfully"
    )
  );
});

export const completeRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId);

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (room.interviewer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only interviewer can complete the interview");
  }

  if (room.status !== "active") {
    throw new ApiError(400, "Only active interview can be completed");
  }

  room.status = "completed";
  room.completedAt = new Date();

  await room.save();

  await Schedule.findOneAndUpdate(
    {
      room: room._id,
      status: "scheduled",
    },
    {
      status: "completed",
    }
  );

  const updatedRoom = await populateRoom(room._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedRoom,
      "Interview completed successfully"
    )
  );
});