import express from "express";
import {
  addServiceToEvent,
  createEvent,
  deleteAllEvents,
  deleteEventById,
  deleteMyEvents,
  getAllEvent,
  getEventById,
  getEventServices,
  getMyEvents,
  getMyEventStats,
  listEventsWithServiceCount,
  updateEventById,
} from "./event.controllers";
import { authorization } from "../../Middleware/authorization";

const router = express.Router();

router.get("/", getAllEvent);
router.post("/", authorization, createEvent);

router.get("/stats", authorization, getMyEventStats);
router.get("/list", authorization, listEventsWithServiceCount);
router.get("/services/:id", authorization, getEventServices);
router.patch("/:id/services", authorization, addServiceToEvent);
router.get("/mine", authorization, getMyEvents);

router.get("/:id", authorization, getEventById);
router.put("/:id", authorization, updateEventById);
router.delete("/", authorization, deleteAllEvents);
router.delete("/mine", authorization, deleteMyEvents);
router.delete("/:id", authorization, deleteEventById);

export default router;
