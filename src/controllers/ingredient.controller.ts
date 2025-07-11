import e, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { errorResponse, successResponse } from "../shared/response";
import { IngredientModel } from "../models/ingredient.model";
import { ingredientTypes } from "../shared/constants";
import { IngredientType } from "../types/ingredient.type";

export const getAllIngredients = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 21;
  const skip = (page - 1) * limit;
  const filter: Record<string, any> = {};
  if (req.query.search) {
    const search = req.query.search;
    filter["$or"] = [{ name: { $regex: search, $options: "i" } }];
  }
  if (req.query.type) {
    if (!ingredientTypes.includes(req.query.type as IngredientType)) {
      errorResponse({
        res,
        message: "Invalid ingredient type",
        statusCode: 400,
      });
    }
    filter.type = req.query.type;
  }
  try {
    const categories = await IngredientModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    if (!categories || categories.length === 0) {
      errorResponse({
        res,
        message: "No ingredients found",
        statusCode: 404,
      });
      return;
    }
    const totalIngredients = await IngredientModel.countDocuments(filter);
    const totalPages = Math.ceil(totalIngredients / limit);
    successResponse({
      res,
      message: "Ingredients fetched successfully",
      data: {
        ingredients: categories,
        pagination: {
          page,
          limit,
          totalIngredients,
          totalPages,
        },
      },
      statusCode: 200,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error fetching ingredients",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
});

export const getIngredientById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const ingredient = await IngredientModel.findById(id);
    if (!ingredient) {
      errorResponse({
        res,
        message: "Ingredient not found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "Ingredient fetched successfully",
      data: ingredient,
      statusCode: 200,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error fetching ingredient",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
});

export const getIngredientByName = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.params;

  try {
    const ingredient = await IngredientModel.findOne({ name: new RegExp(name, "i") });
    if (!ingredient) {
      errorResponse({
        res,
        message: "Ingredient not found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "Ingredient fetched successfully",
      data: ingredient,
      statusCode: 200,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error fetching ingredient",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
});

export const createIngredient = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, image, type } = req.body;

  try {
    const newIngredient = new IngredientModel({ name, description, image, type });
    await newIngredient.save();

    successResponse({
      res,
      message: "Ingredient created successfully",
      data: newIngredient,
      statusCode: 201,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error creating ingredient",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
});

export const updateIngredient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, image, type } = req.body;

  try {
    const updatedIngredient = await IngredientModel.findByIdAndUpdate(
      id,
      { name, description, image, type },
      { new: true }
    );

    if (!updatedIngredient) {
      errorResponse({
        res,
        message: "Ingredient not found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "Ingredient updated successfully",
      data: updatedIngredient,
      statusCode: 200,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error updating ingredient",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
});

export const deleteIngredient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedIngredient = await IngredientModel.findByIdAndDelete(id);
    if (!deletedIngredient) {
      errorResponse({
        res,
        message: "Ingredient not found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "Ingredient deleted successfully",
      data: deletedIngredient,
      statusCode: 200,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error deleting ingredient",
      statusCode: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
});
