import { Router } from "express";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification,
} from "../Notification/Notification.controller";
import { authorization } from "../../Middleware/authorization";

const router = Router();

router.post("/", authorization, createNotification);
router.get("/:userId", authorization, getUserNotifications);
router.patch("/read/:id", authorization, markAsRead);
router.delete("/:id", authorization, deleteNotification);

export default router;
