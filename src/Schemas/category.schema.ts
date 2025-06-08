import { z } from "zod";

export const categorySchema = z.object({
  name: z.string({ required_error: "Category name is required" }).min(1, { message: "Category name cannot be empty" }),

  url: z.string({ required_error: "URL is required" }).url({ message: "Must be a valid URL" }),

  parent_id: z.string({ invalid_type_error: "Parent ID must be a string (ObjectId)" }).optional(),
});

export const updateCategorySchema = categorySchema.partial();
