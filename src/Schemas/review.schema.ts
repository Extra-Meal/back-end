import { z } from "zod";

export const reviewSchema = z.object({
  product_id: z.string({ required_error: "Product ID is required" }),

  description: z
    .string({ required_error: "Review text is required" })
    .min(5, { message: "Review must be at least 5 characters long" }),

  rating: z
    .number({ required_error: "Rating is required" })
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating cannot be more than 5" }),

  user_id: z.string({
    invalid_type_error: "User ID must be a string (ObjectId)",
    required_error: "User ID is required",
  }),
});
