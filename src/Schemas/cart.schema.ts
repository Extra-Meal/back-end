import { z } from "zod";

export const cartItemSchema = z.object({
  product: z.string({ required_error: "You didn't select a product to add to the cart." }),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .multipleOf(0.5, "Quantity must be a multiple of 0.5")
    .min(0.5, "Quantity must be at least 0.5")
    .default(1),
});
