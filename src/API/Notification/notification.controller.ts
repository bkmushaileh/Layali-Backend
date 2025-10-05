import { Request, Response } from "express";
import Notification from "../../Models/Notification";

// ✅ Create notification
export const createNotification = async (req: Request, res: Response) => {
  try {
    const { user, vendor, title, message, type } = req.body;
    const notification = await Notification.create({
      user,
      vendor,
      title,
      message,
      type,
    });
    res.status(201).json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create notification" });
  }
};

// 📥 Get all notifications for a user
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({ user: req.params.userId })
      .populate("vendor", "business_name")
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Failed to get notifications" });
  }
};

// ✅ Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Not found" });
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

// ❌ Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete" });
  }
};
