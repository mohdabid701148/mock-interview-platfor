import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    interviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    scheduledTime: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
      default: 60,
      min: 1,
    },

    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

export const Schedule =
  mongoose.models.Schedule || mongoose.model("Schedule", scheduleSchema);