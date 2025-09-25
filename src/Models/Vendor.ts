import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";

const vendorSchema = new Schema({
  user: { type: Schema.ObjectId, ref: "User", required: true },
  business_name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  bio: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  logo: { type: String, required: true },
  // events: [{ type: Schema.ObjectId, ref: "Event" }],
  // services: [{ type: Schema.ObjectId, ref: "Services" }],
  // category: [{ type: Schema.ObjectId, ref: "Category" }],
  // giftCard: [{ type: Schema.ObjectId, ref: "GiftCard" }],
});

const Vendor = model("Vendor", vendorSchema);

export type VendorAttrs = InferSchemaType<typeof vendorSchema>;
export type VendorDoc = HydratedDocument<VendorAttrs>;
export default Vendor;
