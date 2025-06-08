import mongoose, { Document } from "mongoose";

export interface IProduct extends Document {
  product_name: string;
  description: string;
  initial_price: number;
  final_price: number;
  discount: string;
  currency: "USD" | "EGP" | "EUR" | "GBP";
  in_stock: boolean;
  size: string;
  main_image: string;
  color_name: string;
  model_number: string;
  delivery: string[];
  care_instruction: string;
  features: string[];
  dimensions: {
    title: string;
    value: string;
  }[];
  image_urls?: string[];
  video_urls?: string[];
  rating: number;
  category_id: mongoose.Types.ObjectId;
  category_path: mongoose.Types.ObjectId[];
  brand: string;
  url: string;
}
