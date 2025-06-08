import mongoose, { Schema } from "mongoose";
import { ICategory } from "../types/category.type";

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    parent_id: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  },
  { timestamps: true }
);

const Category = mongoose.model<ICategory>("Category", categorySchema);
export default Category;
