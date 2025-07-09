import { z } from "zod";
import { ObjectIdSchema } from "./objectId.schema";

export const MealInputSchema = z.object({
  name: z.string().min(1),
  thumbnail: z.string().url(),
  category: ObjectIdSchema,
  area: ObjectIdSchema,
  instructions: z.string().optional(),
  tags: z.array(z.string()).default([]).optional(),
  youtube: z.string().url().optional(),
  source: z.string().url().optional(),
  ingredients: z
    .array(
      z.object({
        ingredient: ObjectIdSchema,
        measure: z.string().optional(),
      })
    )
    .default([]),
  kitProduct: ObjectIdSchema.optional(),
  popularityScore: z.number().default(0),
  preparationTime: z.number().optional(), // in minutes
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  available: z.boolean().default(true),
});
