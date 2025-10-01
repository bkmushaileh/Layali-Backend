import { Types } from "mongoose";
import { Event } from "../Models/Event";

type Stats = { total: number; upcoming: number; old: number };

export async function getEventStats(userId: Types.ObjectId): Promise<Stats> {
  const [stats] = await Event.aggregate([
    { $match: { user: userId } },
    {
      $addFields: {
        todayKWT: {
          $dateTrunc: { date: "$$NOW", unit: "day", timezone: "Asia/Kuwait" },
        },
      },
    },
    {
      $facet: {
        total: [{ $count: "count" }],
        upcoming: [
          { $match: { $expr: { $gte: ["$date", "$todayKWT"] } } },
          { $count: "count" },
        ],
        old: [
          { $match: { $expr: { $lt: ["$date", "$todayKWT"] } } },
          { $count: "count" },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        total: { $ifNull: [{ $first: "$total.count" }, 0] },
        upcoming: { $ifNull: [{ $first: "$upcoming.count" }, 0] },
        old: { $ifNull: [{ $first: "$old.count" }, 0] },
      },
    },
  ]);

  return stats ?? { total: 0, upcoming: 0, old: 0 };
}
