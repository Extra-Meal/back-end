import { Schema, model, Document } from "mongoose";
import { IIngredientModel } from "../types/ingredient.type";
import { ingredientTypes } from "../shared/constants";

const ingredientSchema = new Schema<IIngredientModel>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  type: {
    type: String,
    enum: ingredientTypes,
    default: "Other",
  },
  availability: { type: Boolean, default: true },
});

export const IngredientModel = model<IIngredientModel>("Ingredient", ingredientSchema);
