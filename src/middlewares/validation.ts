import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../shared/response";

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body.data || req.body);
  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      message: err.message,
      path: err.path.join("."),
    }));
    errorResponse({
      res,
      message: "Validation failed",
      statusCode: 400,
      error: errors,
    });
    return;
  }
  req.body = result.data;
  next();
};
