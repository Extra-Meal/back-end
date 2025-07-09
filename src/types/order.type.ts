import { z } from "zod";
import { OrderSchema } from "../Schemas/order.schema";
import mongoose from "mongoose";

export type IOrder = z.infer<typeof OrderSchema>;

export interface IOrderModel extends Omit<IOrder, "user_id" | "products"> {
  user_id: mongoose.Types.ObjectId; // Assuming user_id is a string representing the user's ID
  products: {
    product: mongoose.Types.ObjectId; // Assuming product is a string representing the product's ID
    quantity: number;
    priceAtPurchase: number;
  }[];
}
