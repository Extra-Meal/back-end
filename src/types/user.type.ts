import mongoose, { Document } from "mongoose";
import { z } from "zod";
import { userSchema } from "../Schemas/user.schema";

export type IUser = z.infer<typeof userSchema>;

export interface IUserModel extends Document, IUser {}

export type UserTypeWithToken = IUser & {
  token: string;
};
