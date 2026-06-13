import { Feedback } from "../models/Feedback.model.js";
import { Room } from "../models/room.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createNotification } from "../utils/notificationHelper.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// @desc Submit feedback for a completed mock interview room
// @route POST /api/v1/feedback/submit
// @access Private (Only interviewer of the room)
export const submitFeedback = asyncHandler(async (req, res) => {
  const { roomId, scores, comments, recommendation } = req.body;

  if (!roomId) {
    throw new ApiError(400, "Room ID is required");
  }

  // 1. Fetch Room details
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(404, "Mock interview session not found");
  }

  // 2. Validate user is the interviewer
  if (room.interviewer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the designated interviewer can submit feedback");
  }

  // 3. Validate room is completed
  if (room.status !== "completed") {
    throw new ApiError(400, "Feedback can only be submitted after completing the interview session");
  }

  // 4. Ensure there is an interviewee
  if (!room.interviewee) {
    throw new ApiError(400, "Cannot submit feedback for a session without a candidate/interviewee");
  }

  // 5. Ensure scores and comments are provided
  if (!scores || !comments || !recommendation) {
    throw new ApiError(400, "Scores, comments, and hiring recommendation are required");
  }

  const requiredScores = [
    "codingSkills",
    "problemSolving",
    "communication",
    "dsaKnowledge",
    "codeQuality",
    "debugging",
    "speed",
    "overallRating"
  ];

  for (const field of requiredScores) {
    const val = scores[field];
    if (val === undefined || val === null || val < 1 || val > 5) {
      throw new ApiError(400, `Valid score (1-5) is required for ${field}`);
    }
  }

  if (!comments.generalFeedback?.trim()) {
    throw new ApiError(400, "General feedback summary is required");
  }

  // 6. Check if feedback already exists for this room
  const existingFeedback = await Feedback.findOne({ room: roomId });
  if (existingFeedback) {
    throw new ApiError(400, "Feedback has already been submitted for this interview session");
  }

  // 7. Create Feedback
  const feedback = await Feedback.create({
    room: roomId,
    interviewer: room.interviewer,
    interviewee: room.interviewee,
    scores: {
      codingSkills: Number(scores.codingSkills),
      problemSolving: Number(scores.problemSolving),
      communication: Number(scores.communication),
      dsaKnowledge: Number(scores.dsaKnowledge),
      codeQuality: Number(scores.codeQuality),
      debugging: Number(scores.debugging),
      speed: Number(scores.speed),
      overallRating: Number(scores.overallRating),
    },
    comments: {
      technicalComments: comments.technicalComments || "",
      behavioralComments: comments.behavioralComments || "",
      generalFeedback: comments.generalFeedback,
    },
    recommendation,
  });

  // Notify the interviewee
  await createNotification(
    feedback.interviewee,
    "Feedback Received",
    `Your feedback for "${room.title}" is now available.`,
    "feedback"
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      feedback,
      "Post-interview feedback submitted successfully"
    )
  );
});

// @desc Get feedback details for a specific mock interview room
// @route GET /api/v1/feedback/room/:roomId
// @access Private (Only participants of the room)
export const getFeedbackForRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(404, "Mock interview session not found");
  }

  // Check if the requester is either the interviewer or the interviewee
  const isParticipant =
    room.interviewer.toString() === req.user._id.toString() ||
    (room.interviewee && room.interviewee.toString() === req.user._id.toString());

  if (!isParticipant) {
    throw new ApiError(403, "You do not have access to view feedback for this session");
  }

  const feedback = await Feedback.findOne({ room: roomId })
    .populate("interviewer", "username email fullName avatar")
    .populate("interviewee", "username email fullName avatar");

  if (!feedback) {
    throw new ApiError(404, "Feedback not found for this session");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      feedback,
      "Feedback fetched successfully"
    )
  );
});

// @desc Get all feedbacks for the logged-in user (both received and given)
// @route GET /api/v1/feedback/my-feedbacks
// @access Private
export const getMyFeedbacks = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Retrieve feedbacks where user is interviewer OR interviewee
  const feedbacks = await Feedback.find({
    $or: [{ interviewer: userId }, { interviewee: userId }],
  })
    .populate("room", "title roomCode language completedAt startedAt codeState")
    .populate("interviewer", "username email fullName avatar")
    .populate("interviewee", "username email fullName avatar")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      feedbacks,
      "Your feedback reports fetched successfully"
    )
  );
});
