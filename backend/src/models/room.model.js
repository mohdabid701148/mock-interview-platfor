import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
      type: String,
      enum: ["waiting", "scheduled", "active", "completed", "cancelled"],
      default: "waiting",
    },

    language: {
      type: String,
      default: "JavaScript",
    },

    maxParticipants: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

export const Room = mongoose.model("Room", roomSchema);