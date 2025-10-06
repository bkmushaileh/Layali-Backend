import { Request, Response } from "express";
import mongoose from "mongoose";
import Notification from "../../Models/Notification";
import Vendor from "../../Models/Vendor";

// ✅ Create notification
export const createNotification = async (req: Request, res: Response) => {
  try {
    const { user, vendor, title, message, type } = req.body;

    console.log("📩 Incoming notification data:", req.body);

    // ✅ Validate vendor existence BEFORE saving
    if (vendor) {
      const vendorExists = await Vendor.findById(vendor);
      if (!vendorExists) {
        return res.status(400).json({ message: "Invalid vendor ID provided." });
      }
    } else {
      return res.status(400).json({ message: "Vendor ID is required." });
    }

    // ✅ Create notification safely
    const notification = await Notification.create({
      user,
      vendor,
      title,
      message,
      type,
    });

    // ✅ Populate before returning
    const populated = await notification.populate("vendor", "business_name");

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create notification" });
  }
};

// 📥 Get all notifications for a user
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    console.log("📬 Fetching notifications for user:", userId);

    const notifications = await Notification.find({ user: userId })
      .populate("vendor", "business_name")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ message: "Failed to get notifications" });
  }
};

// 📥 Get all notifications for a vendor
export const getVendorNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({
      vendor: req.params.vendorId,
    })
      .populate("vendor", "business_name")
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Failed to get vendor notifications" });
  }
};

// ✅ Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    ).populate("vendor", "business_name");

    if (!notification) return res.status(404).json({ message: "Not found" });
    res.status(200).json(notification);
  } catch (err) {
    console.error("❌ Error marking as read:", err);
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

// ❌ Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    console.error("❌ Error deleting notification:", err);
    res.status(500).json({ message: "Failed to delete" });
  }
};
