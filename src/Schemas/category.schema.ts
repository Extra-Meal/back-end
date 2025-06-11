import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  thumbnail: z
    .string({ required_error: "Thumbnail is required", invalid_type_error: "Thumbnail must be a string" })
    .url("Thumbnail must be a valid URL"),
  description: z
    .string({
      required_error: "Description is required",
      invalid_type_error: "Description must be a string",
    })
    .min(1, "Description is required"),
});

export const updateCategorySchema = categorySchema.partial();
