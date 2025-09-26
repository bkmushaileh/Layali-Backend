import { model, Schema } from "mongoose";

const inviteTemplateSchema = new Schema(
  {
    invites: [{ type: Schema.Types.ObjectId, ref: "Invite" }],
    background: { type: String, required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event" },
  },
  { timestamps: true }
);

const InviteTemplate = model("InviteTemplate", inviteTemplateSchema);

export default InviteTemplate;
