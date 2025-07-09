import User from "../models/user.model";
import { Product } from "../models/product.model";
import Order from "../models/order.model";
import Meal from "../models/meal.model";

import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { errorResponse, successResponse } from "../shared/response";

export const getDashboardData = asyncHandler(async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalProducts, totalMeals, totalRevenue, recentOrders, topMeals, mealDifficulty] =
      await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Meal.countDocuments(),

        // Total revenue from all orders
        Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),

        // Revenue grouped by day (last 7 days)
        Order.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              total: { $sum: "$total" },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        // Top 5 popular meals
        Meal.find()
          .sort({ popularityScore: -1 })
          .limit(5)
          .select("name popularityScore thumbnail")
          .populate("kitProduct", "price"),

        // Meal difficulty breakdown
        Meal.aggregate([
          {
            $group: {
              _id: "$difficulty",
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    const revenue = totalRevenue[0]?.total || 0;

    const result = {
      totalUsers,
      totalProducts,
      totalMeals,
      totalRevenue: revenue,
      revenueLast7Days: recentOrders,
      topMeals,
      mealDifficulty: {
        easy: mealDifficulty.find((d) => d._id === "easy")?.count || 0,
        medium: mealDifficulty.find((d) => d._id === "medium")?.count || 0,
        hard: mealDifficulty.find((d) => d._id === "hard")?.count || 0,
      },
    };
    successResponse({
      res,
      message: "Dashboard data fetched successfully",
      data: result,
      statusCode: 200,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    errorResponse({
      res,
      message: "Failed to fetch dashboard data",
      statusCode: 500,
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});
