import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { errorResponse, successResponse } from "../shared/response";
import Category from "../models/category.model";
import Meal from "../models/meal.model";
const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    if (!categories || categories.length === 0) {
      errorResponse({
        res,
        message: "No categories found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "Categories fetched successfully",
      data: categories,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error fetching categories",
      statusCode: 500,
      error: error instanceof Error ? error : "Unknown error",
    });
    return;
  }
});

const createCategory = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const thumbnail = req.file?.path;

    if (!name || !thumbnail || !description) {
      errorResponse({
        res,
        message: "All fields are required",
        statusCode: 400,
      });
      return;
    }

    const newCategory = new Category({ name, thumbnail, description });
    await newCategory.save();

    successResponse({
      res,
      message: "Category created successfully",
      data: newCategory,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error creating category",
      statusCode: 500,
      error: error instanceof Error ? error : "Unknown error",
    });
    return;
  }
});

const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      errorResponse({
        res,
        message: "Category ID is required",
        statusCode: 400,
      });
      return;
    }

    const category = await Category.findById(id);
    if (!category) {
      errorResponse({
        res,
        message: "Category not found",
        statusCode: 404,
      });
      return;
    }

    const categoryProducts = await Meal.find({ category: id });
    if (categoryProducts && categoryProducts.length > 0) {
      errorResponse({
        res,
        message: "Cannot delete category with associated meals",
        statusCode: 400,
      });
      return;
    }

    await Category.findByIdAndDelete(id);

    successResponse({
      res,
      message: "Category deleted successfully",
      data: category,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error deleting category",
      statusCode: 500,
      error: error instanceof Error ? error : "Unknown error",
    });
    return;
  }
});

const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, thumbnail, description } = req.body;

    if (!id) {
      errorResponse({
        res,
        message: "Category ID is required",
        statusCode: 400,
      });
      return;
    }

    const category = await Category.findById(id);
    if (!category) {
      errorResponse({
        res,
        message: "Category not found",
        statusCode: 404,
      });
      return;
    }

    category.name = name || category.name;
    category.thumbnail = thumbnail || category.thumbnail;
    category.description = description || category.description;

    await category.save();

    successResponse({
      res,
      message: "Category updated successfully",
      data: category,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error updating category",
      statusCode: 500,
      error: error instanceof Error ? error : "Unknown error",
    });
    return;
  }
});

function getCategoryById(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    errorResponse({
      res,
      message: "Category ID is required",
      statusCode: 400,
    });
    return;
  }

  Category.findById(id)
    .then((category) => {
      if (!category) {
        errorResponse({
          res,
          message: "Category not found",
          statusCode: 404,
        });
        return;
      }
      successResponse({
        res,
        message: "Category fetched successfully",
        data: category,
      });
    })
    .catch((error) => {
      errorResponse({
        res,
        message: "Error fetching category",
        statusCode: 500,
        error: error instanceof Error ? error : "Unknown error",
      });
    });
}

function getCategoryByName(req: Request, res: Response) {
  const { name } = req.params;

  if (!name) {
    errorResponse({
      res,
      message: "Category name is required",
      statusCode: 400,
    });
    return;
  }

  Category.findOne({ name })
    .then((category) => {
      if (!category) {
        errorResponse({
          res,
          message: "Category not found",
          statusCode: 404,
        });
        return;
      }
      successResponse({
        res,
        message: "Category fetched successfully",
        data: category,
      });
    })
    .catch((error) => {
      errorResponse({
        res,
        message: "Error fetching category",
        statusCode: 500,
        error: error instanceof Error ? error : "Unknown error",
      });
    });
}

export { getAllCategories, createCategory, deleteCategory, updateCategory, getCategoryById, getCategoryByName };
