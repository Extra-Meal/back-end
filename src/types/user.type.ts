import mongoose, { Document } from "mongoose";
import { z } from "zod";
import { userSchema } from "../Schemas/user.schema";
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  roles: string[];
  isVerified: boolean;
  cart: mongoose.Types.ObjectId[];
  wishlist: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

export type UserType = z.infer<typeof userSchema>;

export type UserTypeWithToken = UserType & {
  token: string;
};
