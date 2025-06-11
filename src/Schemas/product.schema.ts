import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["ingredient", "kit"]),
  ingredient: z.string().optional(),
  meal: z.string().optional(),
  price: z.number().nonnegative().min(0),
  stock: z.number().default(0),
  image: z.string().url().optional(),
  visible: z.boolean().default(true),
});
