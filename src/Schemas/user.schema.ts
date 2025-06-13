import e from "express";
import { z } from "zod";

export const userSchema = z.object({
  avatar: z.string().url({ message: "Avatar must be a valid URL" }).optional(),
  name: z.string({ required_error: "Name is required" }).min(2, { message: "Name must be at least 2 characters" }),

  email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email format" }),

  password: z.string().min(6, { message: "Password must be at least 6 characters long" }).optional(),

  phone: z.string({ invalid_type_error: "Phone must be a string" }).optional(),

  address: z.string({ invalid_type_error: "Address must be a string" }).optional(),

  roles: z.array(z.string({ invalid_type_error: "Roles must be an array of strings" })).optional(),

  emailVerificationToken: z
    .string({
      invalid_type_error: "Email verification token must be a string",
    })
    .nullable()
    .optional()
    .default(null),

  // isVerified is used to check if the user has verified their email
  isVerified: z.boolean({ invalid_type_error: "isVerified must be a boolean" }).optional().default(false),
  isGoogleUser: z.boolean({ invalid_type_error: "isGoogleUser must be a boolean" }).optional().default(false),

  cart: z.array(z.string({ invalid_type_error: "Cart must be an array of product IDs" })).optional(),

  wishlist: z.array(z.string({ invalid_type_error: "Wishlist must be an array of product IDs" })).optional(),
});

export const updateUserSchema = userSchema.partial().extend({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters" })
    .optional(),
  email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email format" }).optional(),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters long" })
    .optional(),
});
