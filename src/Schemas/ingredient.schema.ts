import { z } from "zod";
import { ingredientTypes } from "../shared/constants";

export const IngredientSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  image: z.string().url(),
  type: z.enum(ingredientTypes).default("Other"),
});
