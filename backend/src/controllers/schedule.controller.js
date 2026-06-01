import mongoose from "mongoose";
import { Schedule } from "../models/Schedule.model.js";
import { Room } from "../models/room.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const validStatuses = ["scheduled", "ongoing", "completed", "cancelled"];

const isValidDate = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const hasTimeConflict = (existingSchedules, startTime, durationMinutes) => {
  const newStart = new Date(startTime).getTime();
  const newEnd = newStart + durationMinutes * 60 * 1000;

  return existingSchedules.some((schedule) => {
    const existingStart = new Date(schedule.scheduledTime).getTime();
    const existingEnd = existingStart + schedule.duration * 60 * 1000;

    return newStart < existingEnd && newEnd > existingStart;
  });
};

// CREATE SCHEDULE
export const createSchedule = asyncHandler(async (req, res) => {
  const {
    roomId,
    interviewer,
    interviewee,
    scheduledTime,
    duration = 60,
  } = req.body;

  if (!roomId || !interviewer || !interviewee || !scheduledTime) {
    throw new ApiError(400, "roomId, interviewer, interviewee and scheduledTime are required");
  }

  if (!mongoose.isValidObjectId(roomId)) {
    throw new ApiError(400, "Invalid roomId");
  }

  if (!mongoose.isValidObjectId(interviewer) || !mongoose.isValidObjectId(interviewee)) {
    throw new ApiError(400, "Invalid interviewer or interviewee");
  }

  if (interviewer === interviewee) {
    throw new ApiError(400, "Interviewer and interviewee must be different users");
  }

  const parsedDuration = Number(duration);
  if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
    throw new ApiError(400, "Duration must be a positive number");
  }

  if (!isValidDate(scheduledTime)) {
    throw new ApiError(400, "Invalid scheduledTime");
  }

  const scheduledDate = new Date(scheduledTime);
  if (scheduledDate.getTime() <= Date.now()) {
    throw new ApiError(400, "Cannot schedule an interview in the past");
  }

  const [room, interviewerUser, intervieweeUser] = await Promise.all([
    Room.findById(roomId),
    User.findById(interviewer),
    User.findById(interviewee),
  ]);

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (!interviewerUser) {
    throw new ApiError(404, "Interviewer not found");
  }

  if (!intervieweeUser) {
    throw new ApiError(404, "Interviewee not found");
  }

  const roomParticipantIds = new Set(
    room.participants.map((participant) => participant.toString())
  );

  if (!roomParticipantIds.has(interviewer)) {
    throw new ApiError(400, "Interviewer must be a participant in this room");
  }

  if (!roomParticipantIds.has(interviewee)) {
    throw new ApiError(400, "Interviewee must be a participant in this room");
  }

  const requesterId = req.user?._id?.toString();
  const creatorId = room.createdBy?.toString();

  if (requesterId !== creatorId && !roomParticipantIds.has(requesterId)) {
    throw new ApiError(403, "You are not allowed to schedule interviews in this room");
  }

  const existingSchedules = await Schedule.find({
    status: { $in: ["scheduled", "ongoing"] },
    $or: [
      { interviewer: { $in: [interviewer, interviewee] } },
      { interviewee: { $in: [interviewer, interviewee] } },
    ],
  });

  if (hasTimeConflict(existingSchedules, scheduledDate, parsedDuration)) {
    throw new ApiError(409, "This time overlaps with an existing interview for one of the participants");
  }

  const schedule = await Schedule.create({
    roomId,
    interviewer,
    interviewee,
    scheduledTime: scheduledDate,
    duration: parsedDuration,
    status: "scheduled",
  });

  const populatedSchedule = await Schedule.findById(schedule._id)
    .populate("roomId", "roomCode title language")
    .populate("interviewer", "username fullName email avatar")
    .populate("interviewee", "username fullName email avatar");

  return res
    .status(201)
    .json(new ApiResponse(201, populatedSchedule, "Interview scheduled successfully"));
});

// GET UPCOMING INTERVIEWS (for current user)
export const getUpcomingInterviews = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const myRooms = await Room.find({ participants: userId }).select("_id");
  const myRoomIds = myRooms.map((room) => room._id);

  const now = new Date();

  const interviews = await Schedule.find({
    status: { $in: ["scheduled", "ongoing"] },
    $or: [
      { interviewer: userId },
      { interviewee: userId },
      { roomId: { $in: myRoomIds } },
    ],
  })
    .populate("roomId", "roomCode title language")
    .populate("interviewer", "username fullName email avatar")
    .populate("interviewee", "username fullName email avatar")
    .sort({ scheduledTime: 1 });

  const upcoming = interviews.filter((item) => {
    if (item.status === "ongoing") return true;
    return new Date(item.scheduledTime).getTime() >= now.getTime();
  });

  return res
    .status(200)
    .json(new ApiResponse(200, upcoming, "Upcoming interviews fetched successfully"));
});

// UPDATE SCHEDULE STATUS
export const updateScheduleStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid schedule id");
  }

  if (!status || !validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const schedule = await Schedule.findById(id);
  if (!schedule) {
    throw new ApiError(404, "Schedule not found");
  }

  schedule.status = status;
  await schedule.save();

  const updatedSchedule = await Schedule.findById(schedule._id)
    .populate("roomId", "roomCode title language")
    .populate("interviewer", "username fullName email avatar")
    .populate("interviewee", "username fullName email avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedSchedule, "Schedule status updated successfully"));
});

// CANCEL SCHEDULE
export const cancelSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid schedule id");
  }

  const schedule = await Schedule.findById(id);
  if (!schedule) {
    throw new ApiError(404, "Schedule not found");
  }

  if (schedule.status === "completed") {
    throw new ApiError(400, "Completed interviews cannot be cancelled");
  }

  schedule.status = "cancelled";
  await schedule.save();

  const cancelledSchedule = await Schedule.findById(schedule._id)
    .populate("roomId", "roomCode title language")
    .populate("interviewer", "username fullName email avatar")
    .populate("interviewee", "username fullName email avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, cancelledSchedule, "Interview cancelled successfully"));
});