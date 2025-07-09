import { Request, Response } from "express";
import { startOfDay, subDays } from "date-fns";
import asyncHandler from "express-async-handler";

import User from "../models/user.model";
import { Product } from "../models/product.model";
import Meal from "../models/meal.model";
import Order from "../models/order.model";

import { successResponse, errorResponse } from "../shared/response";

export const getOverviewStats = asyncHandler(async (_req: Request, res: Response) => {
  try {
    const [totalUsers, totalProducts, totalMeals, totalRevenue] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Meal.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
    ]);
    successResponse({
      res,
      data: {
        totalUsers,
        totalProducts,
        totalMeals,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      message: "Overview stats fetched successfully.",
      statusCode: 200,
    });
  } catch (err) {
    errorResponse({ res, message: "Failed to fetch overview stats.", statusCode: 500 });
  }
});

export const getRevenueLastNDays = asyncHandler(async (req: Request, res: Response) => {
  const days = parseInt(req.query.range as string) || 7;
  const today = startOfDay(new Date());

  try {
    const data = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: subDays(today, days) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    successResponse({
      res,
      data,
      message: "Revenue data fetched successfully.",
      statusCode: 200,
    });
  } catch (err) {
    errorResponse({ res, message: "Failed to fetch revenue data.", statusCode: 500 });
  }
});

export const getTopMeals = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 5;

  try {
    const meals = await Meal.find()
      .sort({ popularityScore: -1 })
      .limit(limit)
      .populate("kitProduct", "_id price")
      .select("_id name thumbnail popularityScore kitProduct");

    successResponse({
      res,
      data: meals,
      message: "Top meals fetched successfully.",
      statusCode: 200,
    });
  } catch (err) {
    errorResponse({ res, message: "Failed to fetch top meals.", statusCode: 500 });
  }
});
export const getMealDifficultyStats = asyncHandler(async (_req: Request, res: Response) => {
  try {
    const meals = await Meal.find().select("difficulty");

    const difficultyCount = meals.reduce(
      (acc, meal) => {
        acc[meal.difficulty]++;
        return acc;
      },
      { easy: 0, medium: 0, hard: 0 }
    );

    successResponse({
      res,
      data: difficultyCount,
      message: "Meal difficulty stats fetched successfully.",
      statusCode: 200,
    });
  } catch (err) {
    errorResponse({ res, message: "Failed to fetch meal difficulty data.", statusCode: 500 });
  }
});

export const getLowStockProducts = asyncHandler(async (req: Request, res: Response) => {
  const threshold = parseInt(req.query.threshold as string) || 5;

  try {
    const products = await Product.find({ stock: { $lte: threshold } }).select("_id name stock type");

    successResponse({
      res,
      data: products,
      message: "Low stock products fetched successfully.",
      statusCode: 200,
    });
  } catch (err) {
    errorResponse({ res, message: "Failed to fetch low stock products.", statusCode: 500 });
  }
});

export const getNewUsersChart = asyncHandler(async (req: Request, res: Response) => {
  const days = parseInt(req.query.range as string) || 30;
  const today = startOfDay(new Date());

  try {
    const data = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: subDays(today, days) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    successResponse({
      res,
      data,
      message: "New users chart data fetched successfully.",
      statusCode: 200,
    });
  } catch (err) {
    errorResponse({ res, message: "Failed to fetch new users data.", statusCode: 500 });
  }
});
