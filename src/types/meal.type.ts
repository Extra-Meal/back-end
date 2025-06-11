import { z } from "zod";
import { MealInputSchema } from "../Schemas/meal.schema";
import { Document, Types } from "mongoose";

export type IMeal = z.infer<typeof MealInputSchema>;

export interface IMealModel extends Omit<IMeal, "category" | "area">, Document {
  category: Types.ObjectId;
  area: Types.ObjectId;
}
