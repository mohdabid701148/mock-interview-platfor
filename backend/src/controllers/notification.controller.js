import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// @desc Get current user's notifications and unread count
// @route GET /api/v1/notifications
// @access Private
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const notifications = await Notification.find({ user: userId }).sort({
    createdAt: -1,
  });

  const unreadCount = await Notification.countDocuments({
    user: userId,
    isRead: false,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        unreadCount,
      },
      "Notifications retrieved successfully"
    )
  );
});

// @desc Mark a single notification as read
// @route PATCH /api/v1/notifications/:id/read
// @access Private
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findById(id);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  // Ensure requester is the owner of the notification
  if (notification.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to access this notification");
  }

  if (!notification.isRead) {
    notification.isRead = true;
    // Set deleteAt to 30 days from now to queue for TTL auto-cleanup
    notification.deleteAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await notification.save();
  }

  return res.status(200).json(
    new ApiResponse(200, notification, "Notification marked as read")
  );
});

// @desc Mark all of current user's unread notifications as read
// @route PATCH /api/v1/notifications/read-all
// @access Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Update all unread notifications: set isRead to true and set deleteAt timestamp
  await Notification.updateMany(
    {
      user: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        deleteAt: thirtyDaysFromNow,
      },
    }
  );

  return res.status(200).json(
    new ApiResponse(200, {}, "All notifications marked as read successfully")
  );
});
