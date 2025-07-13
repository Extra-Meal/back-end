import { Schema, model } from "mongoose";
import { IProductModel } from "../types/product.type";

const productSchema = new Schema<IProductModel>({
  name: { type: String, required: true },
  type: { type: String, enum: ["ingredient", "kit"], required: true },
  ingredient: { type: Schema.Types.ObjectId, ref: "Ingredient" }, // if type = ingredient
  meal: { type: Schema.Types.ObjectId, ref: "Meal" }, // if type = kit
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  image: String,
  visible: { type: Boolean, default: true },
  sold: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  discount: { type: Number, default: 0 }, // percent or absolute
  ratingAverage: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
});

export const Product = model<IProductModel>("Product", productSchema);
 