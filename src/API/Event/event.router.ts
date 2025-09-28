import express from "express";
import {
  createEvent,
  deleteAllEvents,
  deleteEventById,
  deleteMyEvents,
  getAllEvent,
  getEventById,
  getMyEvents,
  updateEventById,
} from "./event.controllers";
import { authorization } from "../../Middleware/authorization";

const router = express.Router();

router.get("/", getAllEvent);
router.post("/", authorization, createEvent);
router.get("/mine", authorization, getMyEvents);
router.get("/:id", authorization, getEventById);
router.put("/:id", authorization, updateEventById);
router.delete("/", authorization, deleteAllEvents);
router.delete("/mine", authorization, deleteMyEvents);
router.delete("/:id", authorization, deleteEventById);

export default router;
