import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["interviewer", "interviewee"],
      required: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    leftAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
      default: null,
      index: true,
    },

    participants: {
      type: [participantSchema],
      default: [],
      validate: {
        validator: function (participants) {
          return participants.length <= 2;
        },
        message: "Only two participants are allowed in an interview session",
      },
    },

    status: {
      type: String,
      enum: ["waiting", "scheduled", "active", "completed", "cancelled"],
      default: "waiting",
      index: true,
    },

    language: {
      type: String,
      default: "javascript",
      trim: true,
    },

    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },

    maxParticipants: {
      type: Number,
      default: 2,
      immutable: true,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    codeState: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({
  interviewer: 1,
  status: 1,
  createdAt: -1,
});

roomSchema.index({
  interviewee: 1,
  status: 1,
  createdAt: -1,
});

roomSchema.index({
  "participants.user": 1,
  createdAt: -1,
});

export const Room = mongoose.model("Room", roomSchema);