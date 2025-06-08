import { Schema, model } from "mongoose";
import { IProduct } from "../types/product.type";

const dimensionSchema = new Schema(
  {
    title: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    product_name: { type: String, required: true },
    description: { type: String, required: true },
    initial_price: { type: Number, required: true },
    final_price: { type: Number, required: true },
    discount: { type: String, required: true },
    currency: {
      type: String,
      enum: ["USD", "EGP", "EUR", "GBP"],
      required: true,
      default: "EGP",
    },
    in_stock: { type: Boolean, required: true },
    size: { type: String, required: true },
    main_image: { type: String, required: true },
    color_name: { type: String, required: true },
    model_number: { type: String, required: true },
    delivery: [{ type: String, required: true }],
    care_instruction: { type: String, required: true },
    features: [{ type: String, required: true }],
    dimensions: { type: [dimensionSchema], required: true },
    image_urls: [{ type: String }],
    video_urls: [{ type: String }],
    rating: { type: Number, required: true, min: 0, max: 5 },
    category_id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    category_path: [{ type: Schema.Types.ObjectId, ref: "Category", required: true }],
    brand: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

export const Product = model<IProduct>("Product", productSchema);
