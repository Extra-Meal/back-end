import mongoose, { Schema } from "mongoose";
import { IMealModel } from "../types/meal.type";
import "./product.model";
import "./ingredient.model";

const mealSchema = new Schema<IMealModel>({
  name: { type: String, required: true },
  thumbnail: String,
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  area: { type: Schema.Types.ObjectId, ref: "Area" },
  instructions: String,
  tags: [String],
  youtube: String,
  source: String,
  ingredients: [
    {
      ingredient: { type: Schema.Types.ObjectId, ref: "Ingredient" },
      measure: String,
    },
  ],
  kitProduct: { type: Schema.Types.ObjectId, ref: "Product" }, // references the "kit" version of the meal
});

const Meal = mongoose.model("Meal", mealSchema);
export default Meal;
