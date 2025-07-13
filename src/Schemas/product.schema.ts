import { z } from "zod";
import { MealInputSchema } from "./meal.schema";

export const productSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["ingredient", "kit"]),
  ingredient: z.string().optional(),
  meal: z.union([z.string(), MealInputSchema]).optional(),
  price: z.number().nonnegative().min(0),
  stock: z.number().default(0),
  image: z.string().url().optional(),
  visible: z.boolean().default(true),
  sold: z.number().default(0),
  views: z.number().default(0),
  discount: z.number().default(0), // percent or absolute
  ratingAverage: z.number().default(0),
  ratingCount: z.number().default(0),
});
