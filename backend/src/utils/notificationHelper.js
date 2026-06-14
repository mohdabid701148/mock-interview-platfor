import { Notification } from "../models/notification.model.js";
import { emitToUser } from "../config/socket.js";

/**
 * Creates and persists a notification for a user, then emits a real-time event via Socket.IO if they are online.
 * @param {string|ObjectId} userId - The recipient user's database ID
 * @param {string} title - The title of the notification
 * @param {string} message - The notification detailed description
 * @param {string} type - Enum: 'schedule' | 'cancel' | 'feedback' | 'complete'
 * @returns {Promise<Notification|null>} The created notification document or null if failed
 */
export const createNotification = async (userId, title, message, type, options = {}) => {
  try {
    if (!userId) {
      console.warn("[NotificationHelper] Skip notification: No recipient userId provided");
      return null;
    }

    // 1. Create and save notification in MongoDB with session support
    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      isRead: false,
    });
    
    await notification.save({ session: options.session });

    // 2. Emit real-time WebSockets push event if the recipient user is connected
    emitToUser(userId.toString(), "new-notification", notification);

    console.log(`[NotificationHelper] Saved & dispatched "${title}" notification to user ${userId}`);
    return notification;
  } catch (error) {
    console.error("[NotificationHelper] Error creating notification:", error.message);
    return null;
  }
};
