import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },

    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    interviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
      default: 60,
      enum: [30, 45, 60, 90, 120],
    },

    agenda: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "missed"],
      default: "scheduled",
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

scheduleSchema.index({
  interviewer: 1,
  scheduledAt: 1,
});

scheduleSchema.index({
  interviewee: 1,
  scheduledAt: 1,
});

scheduleSchema.index({
  room: 1,
  status: 1,
});

export const Schedule =
  mongoose.models.Schedule || mongoose.model("Schedule", scheduleSchema);