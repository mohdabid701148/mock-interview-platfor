import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["schedule", "cancel", "feedback", "complete"],
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // TTL index for auto-cleanup. Documents are deleted when deleteAt is reached.
    // We set deleteAt only when isRead is marked as true.
    deleteAt: {
      type: Date,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
