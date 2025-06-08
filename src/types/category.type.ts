import mongoose, { Document } from "mongoose";
import { z } from "zod";
import { categorySchema } from "../Schemas/category.schema";

export interface ICategory extends Document {
  name: string;
  url: string;
  parent_id?: mongoose.Types.ObjectId;
}

export type CategoryType = z.infer<typeof categorySchema>;
