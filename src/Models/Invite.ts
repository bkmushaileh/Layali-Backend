import { model, Schema } from "mongoose";
import crypto from "crypto";

export interface IInvite extends Document {
  event: Schema.Types.ObjectId;
  guestName: string;
  guestEmail: string;
  rsvpStatus: "Pending" | "Attending" | "NotAttending";
  qrCodeToken: string;
  qrCodeImage?: string;
  inviteTemplate?: Schema.Types.ObjectId;
}
const inviteSchema = new Schema<IInvite>(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    rsvpStatus: {
      type: String,
      enum: ["Pending", "Attending", "NotAttending"],
      default: "Pending",
    },
    qrCodeToken: { type: String, unique: true },
    qrCodeImage: { type: String },
    inviteTemplate: { type: Schema.Types.ObjectId, ref: "InviteTemplate" },
  },
  { timestamps: true }
);
inviteSchema.pre("save", async function (next) {
  if (!this.qrCodeToken) {
    this.qrCodeToken = crypto.randomBytes(16).toString("hex");
  }
  next();
});

const Invite = model<IInvite>("Invite", inviteSchema);

export default Invite;
