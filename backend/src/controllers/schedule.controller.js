import mongoose from "mongoose";
import { Schedule } from "../models/Schedule.model.js";
import { Room } from "../models/room.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createNotification } from "../utils/notificationHelper.js";
import { emitToRoom } from "../config/socket.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const validStatuses = ["scheduled", "completed", "cancelled", "missed"];
const validDurations = [30, 45, 60, 90, 120];

const isValidDate = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const populateSchedule = async (scheduleId) => {
  return await Schedule.findById(scheduleId)
    .populate("room", "roomCode title language status meetingLink")
    .populate("interviewer", "username fullName email avatar")
    .populate("interviewee", "username fullName email avatar")
    .populate("createdBy", "username fullName email avatar");
};

const hasTimeConflict = (existingSchedules, startTime, durationMinutes) => {
  const newStart = new Date(startTime).getTime();
  const newEnd = newStart + durationMinutes * 60 * 1000;

  return existingSchedules.some((schedule) => {
    const existingStart = new Date(schedule.scheduledAt).getTime();
    const existingEnd =
      existingStart + schedule.durationMinutes * 60 * 1000;

    return newStart < existingEnd && newEnd > existingStart;
  });
};

export const createSchedule = asyncHandler(async (req, res) => {
  const {
    room,
    roomId,
    scheduledAt,
    scheduledTime,
    durationMinutes = 60,
    duration,
    agenda = "",
  } = req.body;

  const selectedRoomId = room || roomId;
  const selectedTime = scheduledAt || scheduledTime;
  const selectedDuration = Number(durationMinutes || duration || 60);

  if (!selectedRoomId || !selectedTime) {
    throw new ApiError(400, "Room and scheduled time are required");
  }

  if (!mongoose.isValidObjectId(selectedRoomId)) {
    throw new ApiError(400, "Invalid room id");
  }

  if (!isValidDate(selectedTime)) {
    throw new ApiError(400, "Invalid scheduled date and time");
  }

  if (!validDurations.includes(selectedDuration)) {
    throw new ApiError(
      400,
      "Duration must be 30, 45, 60, 90, or 120 minutes"
    );
  }

  const scheduledDate = new Date(selectedTime);

  if (scheduledDate.getTime() <= Date.now()) {
    throw new ApiError(400, "Cannot schedule an interview in the past");
  }

  const interviewRoom = await Room.findById(selectedRoomId);

  if (!interviewRoom) {
    throw new ApiError(404, "Interview session not found");
  }

  if (["active", "completed", "cancelled"].includes(interviewRoom.status)) {
    throw new ApiError(
      400,
      "Only waiting or scheduled interview sessions can be scheduled"
    );
  }

  if (!interviewRoom.interviewer) {
    throw new ApiError(400, "Interview session does not have interviewer");
  }

  if (!interviewRoom.interviewee) {
    throw new ApiError(
      400,
      "Interviewee must join before scheduling the interview"
    );
  }

  const requesterId = req.user._id.toString();
  const interviewerId = interviewRoom.interviewer.toString();
  const intervieweeId = interviewRoom.interviewee.toString();

  if (requesterId !== interviewerId) {
    throw new ApiError(403, "Only interviewer can schedule this interview");
  }

  if (interviewerId === intervieweeId) {
    throw new ApiError(
      400,
      "Interviewer and interviewee must be different users"
    );
  }

  const existingRoomSchedule = await Schedule.findOne({
    room: selectedRoomId,
    status: "scheduled",
  });

  if (existingRoomSchedule) {
    throw new ApiError(
      409,
      "This interview session is already scheduled"
    );
  }

  const existingSchedules = await Schedule.find({
    status: "scheduled",
    $or: [
      { interviewer: { $in: [interviewerId, intervieweeId] } },
      { interviewee: { $in: [interviewerId, intervieweeId] } },
    ],
  });

  if (hasTimeConflict(existingSchedules, scheduledDate, selectedDuration)) {
    throw new ApiError(
      409,
      "This time overlaps with an existing interview for one of the participants"
    );
  }

  const schedule = await Schedule.create({
    room: selectedRoomId,
    interviewer: interviewRoom.interviewer,
    interviewee: interviewRoom.interviewee,
    scheduledAt: scheduledDate,
    durationMinutes: selectedDuration,
    agenda,
    status: "scheduled",
    createdBy: req.user._id,
  });

  if (interviewRoom.status === "waiting") {
    interviewRoom.status = "scheduled";
    await interviewRoom.save();

    // Notify both participants that room is now scheduled
    emitToRoom(interviewRoom, "room-updated", {
      roomId: interviewRoom._id.toString(),
      room: interviewRoom,
    });
  }

  const populatedSchedule = await populateSchedule(schedule._id);

  const formattedDate = new Date(populatedSchedule.scheduledAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  }) + " at " + new Date(populatedSchedule.scheduledAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  await createNotification(
    populatedSchedule.interviewer._id,
    "Interview Scheduled",
    `Your interview "${populatedSchedule.room.title}" has been scheduled for ${formattedDate}.`,
    "schedule"
  );
  await createNotification(
    populatedSchedule.interviewee._id,
    "Interview Scheduled",
    `Your interview "${populatedSchedule.room.title}" has been scheduled for ${formattedDate}.`,
    "schedule"
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      populatedSchedule,
      "Interview scheduled successfully"
    )
  );
});

export const getUpcomingInterviews = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();

  const interviews = await Schedule.find({
    status: "scheduled",
    scheduledAt: { $gte: now },
    $or: [{ interviewer: userId }, { interviewee: userId }],
  })
    .populate("room", "roomCode title language status meetingLink")
    .populate("interviewer", "username fullName email avatar")
    .populate("interviewee", "username fullName email avatar")
    .populate("createdBy", "username fullName email avatar")
    .sort({ scheduledAt: 1 });

  // Exclude schedules whose linked room is no longer upcoming
  const filtered = interviews.filter((schedule) => {
    const roomStatus = schedule.room?.status;
    return !["active", "completed", "cancelled"].includes(roomStatus);
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      filtered,
      "Upcoming interviews fetched successfully"
    )
  );
});

export const updateScheduleStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid schedule id");
  }

  if (!status || !validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid schedule status");
  }

  const schedule = await Schedule.findById(id);

  if (!schedule) {
    throw new ApiError(404, "Schedule not found");
  }

  const requesterId = req.user._id.toString();
  const interviewerId = schedule.interviewer.toString();
  const intervieweeId = schedule.interviewee.toString();

  const isParticipant =
    requesterId === interviewerId || requesterId === intervieweeId;

  if (!isParticipant) {
    throw new ApiError(403, "You are not allowed to update this schedule");
  }

  if (status === "completed" && requesterId !== interviewerId) {
    throw new ApiError(403, "Only interviewer can mark schedule as completed");
  }

  schedule.status = status;
  await schedule.save();

  if (status === "completed") {
    const completedRoom = await Room.findByIdAndUpdate(schedule.room, {
      status: "completed",
      completedAt: new Date(),
    }, { new: true });

    if (completedRoom) {
      emitToRoom(completedRoom, "room-updated", {
        roomId: completedRoom._id.toString(),
        room: completedRoom,
      });
    }
  }

  if (status === "cancelled") {
    const cancelledRoom = await Room.findByIdAndUpdate(schedule.room, {
      status: "cancelled",
    }, { new: true });

    if (cancelledRoom) {
      emitToRoom(cancelledRoom, "room-updated", {
        roomId: cancelledRoom._id.toString(),
        room: cancelledRoom,
      });
    }
  }

  const updatedSchedule = await populateSchedule(schedule._id);

  if (status === "cancelled") {
    await createNotification(
      updatedSchedule.interviewer._id,
      "Interview Cancelled",
      `The interview "${updatedSchedule.room.title}" has been cancelled.`,
      "cancel"
    );
    await createNotification(
      updatedSchedule.interviewee._id,
      "Interview Cancelled",
      `The interview "${updatedSchedule.room.title}" has been cancelled.`,
      "cancel"
    );
  } else if (status === "completed") {
    await createNotification(
      updatedSchedule.interviewer._id,
      "Interview Completed",
      "The interview session has been completed successfully.",
      "complete"
    );
    await createNotification(
      updatedSchedule.interviewee._id,
      "Interview Completed",
      "The interview session has been completed successfully.",
      "complete"
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedSchedule,
      "Schedule status updated successfully"
    )
  );
});

export const cancelSchedule = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid schedule id");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const schedule = await Schedule.findById(id).session(session);

    if (!schedule) {
      throw new ApiError(404, "Schedule not found");
    }

    if (schedule.status === "completed") {
      throw new ApiError(400, "Completed interviews cannot be cancelled");
    }

    const requesterId = req.user._id.toString();
    const interviewerId = schedule.interviewer.toString();
    const intervieweeId = schedule.interviewee.toString();

    const isParticipant =
      requesterId === interviewerId || requesterId === intervieweeId;

    if (!isParticipant) {
      throw new ApiError(403, "You are not allowed to cancel this schedule");
    }

    schedule.status = "cancelled";
    await schedule.save({ session });

    await Room.findByIdAndUpdate(
      schedule.room,
      { status: "waiting" },
      { session }
    );

    // Fetch room title to notify participants
    const roomDoc = await Room.findById(schedule.room).session(session);
    const roomTitle = roomDoc ? roomDoc.title : "Session";

    await createNotification(
      schedule.interviewer,
      "Interview Cancelled",
      `The interview "${roomTitle}" has been cancelled.`,
      "cancel",
      { session }
    );
    await createNotification(
      schedule.interviewee,
      "Interview Cancelled",
      `The interview "${roomTitle}" has been cancelled.`,
      "cancel",
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  // Notify participants that room is back to waiting (after transaction)
  const waitingRoom = await Room.findById(
    (await Schedule.findById(id))?.room
  );
  if (waitingRoom) {
    emitToRoom(waitingRoom, "room-updated", {
      roomId: waitingRoom._id.toString(),
      room: waitingRoom,
    });
  }

  const cancelledSchedule = await populateSchedule(id);

  return res.status(200).json(
    new ApiResponse(
      200,
      cancelledSchedule,
      "Interview schedule cancelled successfully"
    )
  );
});