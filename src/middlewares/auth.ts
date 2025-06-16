// middleware/auth.ts

import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../shared/response";
import jwt from "jsonwebtoken";
import config from "../config/config";
import { IUser } from "../types/user.type";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    errorResponse({
      res,
      message: "Authentication token is missing.",
      statusCode: 401,
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt_secret) as IUser;
    req.user = decoded;
    next();
  } catch (error) {
    errorResponse({
      res,
      message: "Invalid or expired token.",
      statusCode: 401,
    });
  }
};
