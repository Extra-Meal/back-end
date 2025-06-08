import { z } from "zod";

export const dimensionItemSchema = z.object({
  title: z.string({ required_error: "Dimension title is required" }),
  value: z.string({ required_error: "Dimension value is required" }),
});

export const productSchema = z.object({
  product_name: z
    .string({ required_error: "Product name is required" })
    .min(2, { message: "Product name must be at least 2 characters" }),

  description: z
    .string({ required_error: "Description is required" })
    .min(10, { message: "Description must be at least 10 characters" }),

  initial_price: z
    .number({ required_error: "Initial price is required" })
    .nonnegative({ message: "Initial price must be zero or more" }),

  final_price: z
    .number({ required_error: "Final price is required" })
    .nonnegative({ message: "Final price must be zero or more" }),

  discount: z.string({ required_error: "Discount is required" }),

  currency: z.enum(["USD", "EGP", "EUR", "GBP"], {
    required_error: "Currency is required",
    invalid_type_error: "Currency must be a valid code",
  }),

  in_stock: z.boolean({ required_error: "In-stock status is required" }),

  size: z.string({ required_error: "Size is required" }),

  main_image: z
    .string({ required_error: "Main image URL is required" })
    .url({ message: "Main image must be a valid URL" }),

  color_name: z.string({ required_error: "Color name is required" }),

  model_number: z.string({ required_error: "Model number is required" }),

  delivery: z
    .array(
      z.string({
        required_error: "Delivery instructions must be strings",
      })
    )
    .min(1, { message: "At least one delivery note is required" }),

  care_instruction: z.string({ required_error: "Care instruction is required" }),

  features: z
    .array(
      z.string({
        required_error: "Each feature must be a string",
      })
    )
    .min(1, { message: "At least one feature is required" }),

  dimensions: z
    .array(dimensionItemSchema, {
      required_error: "Dimensions must be provided",
    })
    .min(1, { message: "At least one dimension must be provided" }),

  image_urls: z.array(z.string().url({ message: "Image URL must be valid" })).optional(),

  video_urls: z.array(z.string().url({ message: "Video URL must be valid" })).optional(),

  rating: z
    .number({ required_error: "Rating is required" })
    .min(0, { message: "Rating cannot be negative" })
    .max(5, { message: "Rating must be at most 5" }),

  category_id: z.string({ required_error: "Category ID is required" }),

  category_path: z
    .array(
      z.string({
        required_error: "Each category path entry must be an ObjectId string",
      })
    )
    .min(1, { message: "At least one category path item is required" }),

  brand: z.string({ required_error: "Brand is required" }),

  url: z.string({ required_error: "Product URL is required" }).url({ message: "Product URL must be valid" }),
});
