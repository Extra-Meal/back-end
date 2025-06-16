import { Request } from "express";
import { IUser } from "./user.type";

// Extend Express Request type to include 'user'
declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}
