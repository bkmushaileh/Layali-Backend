import express from "express";
import {
  addServiceToEvent,
  createEvent,
  createSuggestions,
  deleteAllEvents,
  deleteEventById,
  deleteMyEvents,
  deleteServiceFromEvent,
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

// ---- General events ----
router.get("/", getAllEvent);
router.post("/", authorization, createEvent);

// ---- Analytics / lists ----
router.get("/stats", authorization, getMyEventStats);
router.get("/list", authorization, listEventsWithServiceCount);

// ---- My events ----
router.get("/mine", authorization, getMyEvents);
router.delete("/mine", authorization, deleteMyEvents);

// ---- Services on events ----
router.get("/services/:id", authorization, getEventServices);
router.patch("/:id/services", authorization, addServiceToEvent);
router.delete(
  "/:eventId/services/:serviceId",
  authorization,
  deleteServiceFromEvent
);

router.post("/:id/suggestions", authorization, createSuggestions);

// ---- Single event operations ----
router.get("/:id", authorization, getEventById);
router.put("/:id", authorization, updateEventById);
router.delete("/:id", authorization, deleteEventById);

// ---- Dangerous: delete all ----
router.delete("/", authorization, deleteAllEvents);

export default router;
