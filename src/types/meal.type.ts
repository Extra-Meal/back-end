import { z } from "zod";
import { MealInputSchema } from "../Schemas/meal.schema";
import { Document } from "mongoose";
import { ICategoryModel } from "./category.type";
import { IAreaModel } from "./area.type";
import { IProductModel } from "./product.type";

export type IMeal = z.infer<typeof MealInputSchema>;

export interface IMealModel extends Omit<IMeal, "category" | "area" | "kitProduct">, Document {
  category: ICategoryModel;
  area: IAreaModel;
  kitProduct: IProductModel;
}
