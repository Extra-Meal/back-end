import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { errorResponse, successResponse } from "../shared/response";
import Meal from "../models/meal.model";

//Get all meals
const getAllMeals = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;
  const filter = {};
});
