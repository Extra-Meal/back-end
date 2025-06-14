import { validate } from "./../middlewares/validation";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { errorResponse, successResponse } from "../shared/response";
import Meal from "../models/meal.model";
import { IngredientModel } from "../models/ingredient.model";

const getAllMeals = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;
  const filter: Record<string, any> = {};
  if (req.query.search) {
    const search = req.query.search;
    filter["$or"] = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
  }
  if (req.query.ingredients) {
    try {
      const queryIngredients = (req.query.ingredients as string).split(",");
      filter["ingredients.ingredient"] = { $all: queryIngredients };
    } catch (err) {
      console.error("Error fetching ingredients:", err);
      return;
    }
  }
  if (req.query.category) {
    const category = req.query.category;
    filter.category = category;
  }
  if (req.query.area) {
    const area = req.query.area;
    filter.area = area;
  }
  if (req.query.product) {
    const product = req.query.product;
    filter.kitProduct = product;
  }

  try {
    const meals = await Meal.find(filter)
      .populate("category", "name -_id")
      .populate("area", "name -_id")
      .populate("ingredients.ingredient", "name -_id")
      .populate("kitProduct", "name -_id")
      .skip(skip)
      .limit(limit);
    if (!meals || meals.length === 0) {
      errorResponse({
        res,
        message: "No meals found",
        statusCode: 404,
      });
      return;
    }
    const totalMeals = await Meal.countDocuments(filter);
    const totalPages = Math.ceil(totalMeals / limit);
    successResponse({
      res,
      message: "Meals fetched successfully",
      data: {
        meals,
        pagination: {
          page,
          limit,
          totalMeals,
          totalPages,
        },
      },
      statusCode: 200,
    });
    return;
  } catch (error) {
    console.error("Error fetching meals:", error);
    errorResponse({
      res,
      message: "Failed to fetch meals",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
});

const getMealById = asyncHandler(async (req: Request, res: Response) => {
  const mealId = req.params.id;
  if (!mealId) {
    errorResponse({
      res,
      message: "Meal ID is required",
      statusCode: 400,
    });
    return;
  }

  try {
    const meal = await Meal.findById(mealId)
      .populate("category", "name -_id")
      .populate("area", "name -_id")
      .populate("ingredients.ingredient", "name -_id")
      .populate("kitProduct", "name -_id");

    if (!meal) {
      errorResponse({
        res,
        message: "Meal not found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "Meal fetched successfully",
      data: meal,
      statusCode: 200,
    });
    return;
  } catch (error) {
    console.error("Error fetching meal:", error);
    errorResponse({
      res,
      message: "Failed to fetch meal",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
});

const getMealByName = asyncHandler(async (req: Request, res: Response) => {
  const mealName = req.params.name;
  if (!mealName) {
    errorResponse({
      res,
      message: "Meal name is required",
      statusCode: 400,
    });
    return;
  }

  try {
    const meal = await Meal.findOne({ name: { $regex: mealName, $options: "i" } })
      .populate("category", "name -_id")
      .populate("area", "name -_id")
      .populate("ingredients.ingredient", "name -_id")
      .populate("kitProduct", "name -_id");

    if (!meal) {
      errorResponse({
        res,
        message: "Meal not found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "Meal fetched successfully",
      data: meal,
      statusCode: 200,
    });
    return;
  } catch (error) {
    console.error("Error fetching meal by name:", error);
    errorResponse({
      res,
      message: "Failed to fetch meal by name",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
});

const createMeal = asyncHandler(async (req: Request, res: Response) => {
  const mealData = req.body;

  if (!mealData.name) {
    errorResponse({
      res,
      message: "Meal name is required",
      statusCode: 400,
    });
    return;
  }

  try {
    const newMeal = new Meal(mealData);
    await newMeal.save();

    successResponse({
      res,
      message: "Meal created successfully",
      data: newMeal,
      statusCode: 201,
    });
    return;
  } catch (error) {
    console.error("Error creating meal:", error);
    errorResponse({
      res,
      message: "Failed to create meal",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
});

const updateMeal = asyncHandler(async (req: Request, res: Response) => {
  const mealId = req.params.id;
  const mealData = req.body;

  if (!mealId) {
    errorResponse({
      res,
      message: "Meal ID is required",
      statusCode: 400,
    });
    return;
  }

  try {
    const updatedMeal = await Meal.findByIdAndUpdate(mealId, mealData, { new: true });

    if (!updatedMeal) {
      errorResponse({
        res,
        message: "Meal not found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "Meal updated successfully",
      data: updatedMeal,
      statusCode: 200,
    });
    return;
  } catch (error) {
    console.error("Error updating meal:", error);
    errorResponse({
      res,
      message: "Failed to update meal",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
});

const deleteMeal = asyncHandler(async (req: Request, res: Response) => {
  const mealId = req.params.id;

  if (!mealId) {
    errorResponse({
      res,
      message: "Meal ID is required",
      statusCode: 400,
    });
    return;
  }

  try {
    const deletedMeal = await Meal.findByIdAndDelete(mealId);

    if (!deletedMeal) {
      errorResponse({
        res,
        message: "Meal not found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "Meal deleted successfully",
      data: deletedMeal,
      statusCode: 200,
    });
    return;
  } catch (error) {
    console.error("Error deleting meal:", error);
    errorResponse({
      res,
      message: "Failed to delete meal",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
});

export { getAllMeals, getMealById, getMealByName, createMeal, updateMeal, deleteMeal };
