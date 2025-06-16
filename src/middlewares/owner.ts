// middleware/owner.ts

import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { errorResponse } from "../shared/response";
export const ownerMiddleware = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  const user = req.user;
  if (!user) {
    errorResponse({
      res,
      message: "You must be logged in to perform this action",
      statusCode: 404,
    });
    return;
  }
  if (user?._id?.toString() !== userId) {
    errorResponse({
      res,
      message: "You are not authorized to perform this action",
      statusCode: 403,
    });
    return;
  }
  next();
});
