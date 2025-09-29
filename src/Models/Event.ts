import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";

const eventSchema = new Schema(
  {
    user: { type: Schema.ObjectId, ref: "User", required: true },
    budget: { type: Number, min: 0, required: true },
    date: { type: Date, required: true },
    location: { type: String, trim: true, required: true },
    services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    invites: [{ type: Schema.Types.ObjectId, ref: "Invite" }],
    // giftCards: [{ type: Schema.Types.ObjectId, ref: "GiftCard" }],
  },
  { timestamps: true }
);

export const Event = model("Event", eventSchema);
export type EventAttrs = InferSchemaType<typeof eventSchema>;
export type EventDoc = HydratedDocument<EventAttrs>;
