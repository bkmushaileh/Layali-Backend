import { Router } from "express";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification,
  getVendorNotifications,
} from "../Notification/notification.controller";
import { authorization } from "../../Middleware/authorization";

const router = Router();

router.post("/", authorization, createNotification);
router.get("/:userId", authorization, getUserNotifications);
router.get("/vendor/:vendorId", getVendorNotifications);
router.patch("/read/:id", authorization, markAsRead);
router.delete("/:id", authorization, deleteNotification);

export default router;
