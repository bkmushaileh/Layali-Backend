import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";

const userSchema = new Schema({
  role: {
    type: String,
    enum: ["Admin", "Vendor", "Couple", "Normal"],
    default: "Normal",
    required: true,
  },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  vendors: [{ type: Schema.ObjectId, ref: "Vendor" }],
  events: [{ type: Schema.ObjectId, ref: "Event" }],
});

const User = model("User", userSchema);

export type UserAttrs = InferSchemaType<typeof userSchema>;
export type UserDoc = HydratedDocument<UserAttrs>;
export default User;
