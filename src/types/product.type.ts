import { Document, Types } from "mongoose";
import { z } from "zod";
import { productSchema } from "../Schemas/product.schema";
import { IMeal } from "./meal.type";
import { IIngredient } from "./ingredient.type";

export type IProduct = z.infer<typeof productSchema>;

export interface IProductModel extends Document, Omit<IProduct, "meal" | "ingredient"> {
  meal?: IMeal; // if type = kit
  ingredient?: IIngredient; // if type = ingredient
}
