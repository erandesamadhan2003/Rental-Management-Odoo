import Notification from "../models/notification.model.js";

const handleError = (res, error, message = "An error occurred", status = 500) => {
  console.error(error);
  res.status(status).json({ success: false, message, error: error.message });
};

// Get my notifications
export const getMyNotifications = async (req, res) => {
  try {
    const { clerkId } = req.query;
    const notifications = await Notification.find({ userClerkId: clerkId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    handleError(res, error, "Failed to fetch notifications");
  }
};

// Mark notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    res.status(200).json({ success: true, message: "Notification marked as read", notification });
  } catch (error) {
    handleError(res, error, "Failed to update notification");
  }
};
