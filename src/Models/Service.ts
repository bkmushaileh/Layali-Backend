import { model, Schema } from "mongoose";

const ServiceSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    vendor: { type: Schema.ObjectId, ref: "Vendor" },
    categories: [{ type: Schema.ObjectId, ref: "Category" }],
  },
  { timestamps: true }
);

const Service = model("Service", ServiceSchema);

export default Service;
