import { NextFunction, Request, Response } from "express";
import { Event } from "../../Models/Event";

const getAllEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await Event.find().populate("invites");
    if (!events.length) {
      return next({ message: "No Event Found!", status: 404 });
    }
    return res.status(200).json({
      message: "Events list:",
      events,
    });
  } catch (err) {
    console.error("getAllEvent error:", err);
    return next({
      status: 500,
      message: "Something went wrong during getAllEvent",
    });
  }
};

const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { budget, date, location, services, invites, giftCards } = req.body;
    if (!budget || !date || !location) {
      return next({
        status: 400,
        message: "Budget, date, and location are required.",
      });
    }
    const role = req.user?.role;
    if (role == "Admin" || role == "Vendor") {
      return next({
        status: 403,
        message: "Admins and Vendors cannot create events",
      });
    }

    const event = await Event.create({
      user: req.user?._id,
      budget,
      date,
      location,
      services: services || [],
      invites: invites || [],
      // giftCards: giftCards || [],
    });

    const populated = await event.populate([
      "services",
      "invites",
      // "giftCards",
    ]);

    return res.status(201).json({
      message: "Event Created Successfully!",
      event,
    });
  } catch (err) {
    console.error("createEvent error:", err);
    return next({
      status: 500,
      message: "Something went wrong during createEvent",
    });
  }
};

const getEventById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) return next({ status: 400, message: "Event id is required" });

    const event = await Event.findById(id).populate("invites");

    if (!event) {
      next({ status: 404, message: "Event Not Found!" });
    }
    const role = req.user?.role;
    if (role == "Admin" || role == "Vendor") {
      return next({
        status: 403,
        message: "Admins and Vendors are not allowed to view events",
      });
    }

    if (String(event?.user) !== String(req.user?._id)) {
      return next({
        status: 403,
        message: "You are not allowed to view this event",
      });
    }
    console.log(id);
    console.log(req.user?._id);
    return res.status(200).json({
      message: "Event details",
      event,
    });
  } catch (err) {
    console.error("getEventById error:", err);
    return next({
      status: 500,
      message: "Something went wrong during getEventById",
    });
  }
};

const updateEventById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { budget, date, location, services, invites, giftCards } =
      req.body || {};
    const role = req.user?.role;

    if (role == "Admin" || role == "Vendor") {
      return next({
        status: 403,
        message: "Admins and Vendors are not allowed to update this event",
      });
    }
    if (!id) return next({ status: 400, message: "Event id is required" });

    const event = await Event.findById(id).populate([
      "services",
      "invites",
      // "giftCards",
    ]);

    if (!event) {
      next({ status: 404, message: "Event Not Found!" });
    }
    if (String(event?.user) !== String(req.user?._id)) {
      return next({
        status: 403,
        message: "You are not allowed to update this event",
      });
    }
    const update: any = {};
    if (budget !== undefined) update.budget = Number(budget);
    if (date !== undefined) update.date = new Date(date);
    if (location !== undefined) update.location = String(location).trim();
    if (services !== undefined) update.services = services;
    if (invites !== undefined) update.invites = invites;

    const Updatedevent = await Event.findOneAndUpdate(
      { _id: id, user: req.user?._id },
      { $set: update },
      { new: true, runValidators: true }
    ).populate(["services", "invites"]);
    return res.status(200).json({
      message: "Event updated",
      event: Updatedevent,
    });
  } catch (err) {
    console.error("updateEvent error:", err);
    return next({
      status: 500,
      message: "Something went wrong during updateEvent",
    });
  }
};
const deleteEventById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const role = req.user?.role;

    if (role == "Vendor") {
      return next({
        status: 403,
        message: "Vendors are not allowed to delete this event",
      });
    }
    if (!id) return next({ status: 400, message: "Event id is required" });

    const event = await Event.findById(id);

    if (!event) {
      next({ status: 404, message: "Event Not Found!" });
    }
    if (String(event?.user) !== String(req.user?._id)) {
      return next({
        status: 403,
        message: "You are not allowed to delete this event",
      });
    }
    await event?.deleteOne();

    return res.status(200).json({
      message: "Event deleted successfully",
      event: event,
    });
  } catch (err) {
    console.error("deleteEvent error:", err);
    return next({
      status: 500,
      message: "Something went wrong during deleteEventById",
    });
  }
};

export const deleteAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role !== "Admin") {
      return next({ status: 403, message: "Only Admin can delete all events" });
    }
    const result = await Event.deleteMany({});

    return res.status(200).json({
      message: `All events deleted (${result.deletedCount} removed)`,
    });
  } catch (err) {
    console.error("deleteAllEvents error:", err);
    return next({
      status: 500,
      message: "Something went wrong during deleteAllEvents",
    });
  }
};

const deleteMyEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user?.role == "Admin" || req.user?.role == "Vendor") {
      return next({
        status: 403,
        message: "Admins and Vendors are not allowed to delete events",
      });
    }

    const result = await Event.deleteMany({ user: req.user?._id });

    return res.status(200).json({
      message: `Deleted ${result.deletedCount} events`,
    });
  } catch (err) {
    console.error("deleteMyEvents error:", err);
    return next({
      status: 500,
      message: "Something went wrong during deleteMyEvents",
    });
  }
};
const getMyEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role === "Admin" || req.user?.role === "Vendor") {
      return next({
        status: 403,
        message: "Admins and Vendors are not allowed to view events",
      });
    }

    const events = await Event.find({ user: req.user?._id });

    if (!events.length) {
      return next({ status: 404, message: "No events found for this user" });
    }

    return res.status(200).json({
      message: "My events",
      events,
    });
  } catch (err) {
    console.error("getMyEvents error:", err);
    return next({
      status: 500,
      message: "Something went wrong during getMyEvents",
    });
  }
};

export {
  getAllEvent,
  createEvent,
  getEventById,
  updateEventById,
  deleteEventById,
  deleteMyEvents,
  getMyEvents,
};
