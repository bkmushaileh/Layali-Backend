import { model, Schema } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    services: [{ type: Schema.ObjectId, ref: "Service" }],
    vendors: [{ type: Schema.ObjectId, ref: "Vendor" }],
  },
  { timestamps: true }
);

const Category = model("Category", CategorySchema);

export default Category;
