// middleware/roles.ts
import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../shared/response";
import { IUser } from "../types/user.type";

export const rolesMiddleware = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      errorResponse({
        res,
        message: "You must be logged in to access this resource.",
        statusCode: 403,
      });
      return;
    }

    const userRoles = user.roles || [];
    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      errorResponse({
        res,
        message: "You do not have permission to access this resource.",
        statusCode: 403,
      });
      return;
    }

    next();
  };
};
