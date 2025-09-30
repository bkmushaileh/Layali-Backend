import mongoose from "mongoose";

const giftCardSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    couple: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: false,
    },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["active", "redeemed", "expired"],
      default: "active",
    },
    expirationDate: { type: Date, index: true },
    redeemedAt: { type: Date },
    redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("GiftCard", giftCardSchema);
