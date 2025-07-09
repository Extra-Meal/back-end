import { z } from "zod";

export const OrderSchema = z.object({
  user_id: z.string().uuid(),
  products: z.array(
    z.object({
      product: z.string().uuid(),
      quantity: z.number().min(1),
      priceAtPurchase: z.number().min(0),
    })
  ),
  total: z.number().min(0),
  status: z.enum(["pending", "shipped", "delivered", "cancelled"]),
  paymentMethod: z.enum(["credit_card", "paypal", "cash"]),
  isPaid: z.boolean(),
  paidAt: z.date().optional(),
  shippedAt: z.date().optional(),
  deliveredAt: z.date().optional(),
});
