import { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

type SuccessResponseParams<T> = {
  res: Response;
  data?: T;
  message?: string;
  statusCode?: number;
};
export const successResponse = <T>({ res, data, message = "success", statusCode = 200 }: SuccessResponseParams<T>) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};
type ErrorResponseParams = {
  res: Response;
  message?: string;
  error?: any;
  statusCode?: number;
};
export const errorResponse = ({ res, message = "An error occurred", error, statusCode = 500 }: ErrorResponseParams) => {
  const response: ApiResponse = {
    success: false,
    message,
    error,
  };
  return res.status(statusCode).json(response);
};
