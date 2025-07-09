import { Schema } from "mongoose";
import { IOrderModel } from "../types/order.type";
const orderSchema = new Schema<IOrderModel>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        priceAtPurchase: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
    status: { type: String, enum: ["pending", "shipped", "delivered", "cancelled"], default: "pending" },
    paymentMethod: { type: String, enum: ["credit_card", "paypal", "cash"], default: "cash" },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);
