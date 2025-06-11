import mongoose, { Schema } from "mongoose";
import { ICategoryModel } from "../types/category.type";

const categorySchema = new Schema<ICategoryModel>(
  {
    name: { type: String, required: true },
    thumbnail: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const Category = mongoose.model<ICategoryModel>("Category", categorySchema);
export default Category;
