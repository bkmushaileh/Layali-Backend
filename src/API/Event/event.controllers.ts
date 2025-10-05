import { NextFunction, Request, Response } from "express";
import { Event } from "../../Models/Event";
import User from "../../Models/User";
import { getEventStats } from "../../Utils/eventstats";
import { FlattenMaps, Types } from "mongoose";
import Service from "../../Models/Service";
import { env } from "../../Config/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  fallbackCheapest,
  respondWithFallback,
  safeParseJSON,
  SuggestionsBody,
} from "../../Utils/gemini";

const ai = new GoogleGenerativeAI(env.GEMINI_API_KEY!);

const getAllEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await Event.find().populate(["invites", "services"]);
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
    await User.findByIdAndUpdate(
      req.user?._id,
      { $addToSet: { events: event._id } },
      { new: true }
    );

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

    const event = await Event.findById(id).populate(["invites", "services"]);

    if (!event) {
      return next({ status: 404, message: "Event Not Found!" });
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
      return next({ status: 404, message: "Event Not Found!" });
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
      return next({ status: 404, message: "Event Not Found!" });
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

    const events = await Event.find({ user: req.user?._id }).populate([
      "invites",
      "services",
    ]);

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

const getMyEventStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    const stats = await getEventStats(userId!);
    return res.status(200).json({
      message: "My event stats",
      stats,
    });
  } catch (err) {
    console.error("getMyEventStats error:", err);
    return next({
      status: 500,
      message: "Something went wrong during getMyEventStats",
    });
  }
};

const listEventsWithServiceCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?._id;
  return Event.aggregate([
    { $match: { user: new Types.ObjectId(userId) } },
    {
      $addFields: {
        servicesCount: { $size: { $ifNull: ["$services", []] } },
      },
    },
    { $sort: { date: 1 } },
  ]);
};

const getEventServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const event = await Event.findOne({ _id: id, user: userId }).populate({
      path: "services",
      select: "name price image type time description",
    });

    if (!event) return next({ status: 404, message: "Event not found" });

    const services = event.services ?? [];
    return res
      .status(200)
      .json({ _id: event._id, servicesCount: services.length, services });
  } catch (err) {
    return next({ status: 500, message: "Failed to get event services" });
  }
};

const addServiceToEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { serviceId } = req.body;
    const event = await Event.findOne({ _id: id, user: userId }).populate(
      "services"
    );
    if (!event) return next({ status: 404, message: "Event not found" });

    const service = await Service.findById(serviceId);
    if (!service) return next({ status: 404, message: "Service not found" });

    const currentTotal = event.services.reduce(
      (sum, s: any) => sum + Number(s.price || 0),
      0
    );
    const newTotal = currentTotal + Number(service.price || 0);

    if (newTotal > event.budget) {
      return next({
        status: 400,
        message: "Adding this service exceeds your event budget",
      });
    }
    const updated = await Event.findOneAndUpdate(
      { _id: id, user: userId },
      { $addToSet: { services: new Types.ObjectId(serviceId) } },
      { new: true }
    ).populate({
      path: "services",
      select: "name price image type time description",
    });

    if (!updated) return next({ status: 404, message: "Event not found" });

    return res.status(200).json({
      message: "Service added",
      event: updated,
      totals: {
        budget: Number(event.budget || 0),
        previousTotal: currentTotal,
        added: Number(service.price || 0),
        newTotal,
        remaining: Number(event.budget || 0) - newTotal,
      },
    });
  } catch (e) {
    next({ status: 500, message: "Failed to add service" });
  }
};

const deleteServiceFromEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId, serviceId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return next({ status: 404, message: "Event not found" });
    }
    if (String(event.user) !== String(req.user?._id)) {
      return next({
        status: 403,
        message: "You are not allowed to update this event",
      });
    }

    const updated = await Event.findByIdAndUpdate(
      eventId,
      { $pull: { services: new Types.ObjectId(serviceId) } },
      { new: true }
    ).populate("services");

    return res.status(200).json({
      message: "Service removed from event",
      event: updated,
    });
  } catch (err) {
    console.error("removeServiceFromEvent error:", err);
    return next({
      status: 500,
      message: "Something went wrong while removing service from event",
    });
  }
};

export const createSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: eventId } = req.params;
    if (!eventId) return next({ status: 400, message: "Event id is required" });

    const role = req.user?.role;
    if (role === "Admin" || role === "Vendor") {
      return next({
        status: 403,
        message: "Admins and Vendors are not allowed to request suggestions",
      });
    }

    const body = (req.body || {}) as SuggestionsBody;
    const requiredCategories = Array.isArray(body.requiredCategories)
      ? body.requiredCategories
      : [];

    const event = await Event.findById(eventId).lean();
    if (!event) return next({ status: 404, message: "Event not found" });
    if (String(event.user) !== String(req.user?._id)) {
      return next({
        status: 403,
        message: "You are not allowed to use this event",
      });
    }

    const budgetBufferPercent = 5;
    const limitForAI = 50;

    const hardBudget = event.budget ? Number(event.budget) : null;

    const query: any = {};
    if (requiredCategories.length)
      query.categories = { $in: requiredCategories };
    if (hardBudget) {
      const cap = Math.floor(hardBudget * (1 + budgetBufferPercent / 100));
      query.price = { $lte: cap };
    }

    const candidates = await Service.find(query)
      .select("name price image type time description categories vendor")
      .limit(limitForAI)
      .lean();

    if (!candidates.length) {
      return res.status(200).json({
        strategy: "fallback",
        budget: hardBudget,
        items: [],
        totalPrice: 0,
        rationale: "No services matched filters.",
        notes: hardBudget
          ? `Price cap used: ~${Math.floor(
              hardBudget * (1 + budgetBufferPercent / 100)
            )}`
          : undefined,
      });
    }

    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const generationConfig = { responseMimeType: "application/json" };

    const sysPrompt = `
You help select the best set of event services under a hard budget if provided.
Rules:
- If "hardBudget" is a number, never exceed it.
- Prefer better value (lower price within budget).
Return ONLY JSON with this shape:
{
  "selection": [ { "_id": "string", "reason": "short" } ],
  "totalPrice": number,
  "rationale": "short paragraph",
  "notes": "optional"
}
`;

    const userPayload = {
      budget: hardBudget,
      candidates: candidates.map((c) => ({
        _id: String(c._id),
        name: c.name,
        price: Number(c.price || 0),
        categories: (c as any).categories ?? null,
        type: (c as any).type ?? null,
      })),
    };
    let text: string;
    try {
      const result = await model.generateContent({
        contents: [
          { role: "user", parts: [{ text: sysPrompt }] },
          { role: "user", parts: [{ text: JSON.stringify(userPayload) }] },
        ],
        generationConfig,
      });
      text = result.response.text();
      if (!text) throw new Error("No response text from Gemini");
    } catch (e: any) {
      console.error("Gemini error:", e?.message || e);
      return await respondWithFallback(
        res,
        candidates,
        hardBudget,
        "Gemini unavailable; used fallback."
      );
    }

    const json = safeParseJSON(String(text).trim());
    if (!json || !Array.isArray(json.selection)) {
      return await respondWithFallback(
        res,
        candidates,
        hardBudget,
        "Invalid AI response; used fallback."
      );
    }

    const priceMap = new Map(
      candidates.map((c) => [String(c._id), Number(c.price || 0)])
    );
    let total = 0;
    const trimmedSelection: Array<{ _id: string; reason?: string }> = [];
    for (const item of json.selection) {
      const p = priceMap.get(String(item._id)) ?? 0;
      if (!hardBudget || total + p <= hardBudget) {
        trimmedSelection.push({
          _id: String(item._id),
          reason: item.reason || "AI-picked",
        });
        total += p;
      } else {
        break;
      }
    }

    if (!trimmedSelection.length) {
      return await respondWithFallback(
        res,
        candidates,
        hardBudget,
        "Invalid AI response; used fallback."
      );
    }

    const selectedIds = trimmedSelection.map((s) => s._id);
    const selectedDocs = await Service.find({ _id: { $in: selectedIds } })
      .select("name price image type vendor")
      .lean();

    const items = trimmedSelection.map((sel) => {
      const doc = selectedDocs.find((d) => String(d._id) === sel._id);

      return {
        _id: sel._id,
        name: doc?.name,
        price: doc?.price,
        type: doc?.type,
        image: doc?.image,
        reason: sel.reason,
      };
    });
    console.log(items[0]);

    return res.status(200).json({
      strategy: "gemini",
      budget: hardBudget,
      selection: trimmedSelection,
      items,
      totalPrice: total,
      rationale: json.rationale || "AI-ranked selection.",
      notes: json.notes,
    });
  } catch (err) {
    console.error("createSuggestions error:", err);
    return next({
      status: 500,
      message: "Something went wrong during createSuggestions",
    });
  }
};

export {
  deleteServiceFromEvent,
  addServiceToEvent,
  getEventServices,
  listEventsWithServiceCount,
  getAllEvent,
  createEvent,
  getEventById,
  updateEventById,
  deleteEventById,
  deleteMyEvents,
  getMyEvents,
  getMyEventStats,
};
