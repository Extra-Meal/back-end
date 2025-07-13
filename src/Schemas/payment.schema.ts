import { z } from "zod";

export const CreatePaymentIntentSchema = z.object({
  amount: z.number().positive("Amount must be a positive number"),
  currency: z.string().default("usd"),
  metadata: z.record(z.string()).optional(),
});

export const CreateCheckoutSessionSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.string(),
      quantity: z.number().positive(),
      price: z.number().positive(),
      name: z.string(),
      description: z.string().optional(),
      image: z.string().optional(),
    })
  ),
  success_url: z.string().url().optional(),
  cancel_url: z.string().url().optional(),
  customer_email: z.string().email().optional(),
  metadata: z.record(z.string()).optional(),
});

export const WebhookEventSchema = z.object({
  id: z.string(),
  object: z.string(),
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
});

export const ConfirmPaymentSchema = z.object({
  payment_intent_id: z.string(),
  order_id: z.string(),
});

export type CreatePaymentIntentInput = z.infer<typeof CreatePaymentIntentSchema>;
export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionSchema>;
export type WebhookEventInput = z.infer<typeof WebhookEventSchema>;
export type ConfirmPaymentInput = z.infer<typeof ConfirmPaymentSchema>;
