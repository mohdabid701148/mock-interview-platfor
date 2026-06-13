import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      unique: true, // restrict to 1 feedback report per interview room
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

    scores: {
      codingSkills: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      problemSolving: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      communication: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      dsaKnowledge: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      codeQuality: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      debugging: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      speed: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      overallRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
    },

    comments: {
      technicalComments: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },
      behavioralComments: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },
      generalFeedback: {
        type: String,
        trim: true,
        maxlength: 2000,
        required: true,
      },
    },

    recommendation: {
      type: String,
      enum: ["strong_hire", "hire", "leaning_no_hire", "no_hire"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Feedback =
  mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
