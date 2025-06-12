import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { errorResponse, successResponse } from "../shared/response";

import Area from "../models/area.model";
import Meal from "../models/meal.model";

const getAllAreas = asyncHandler(async (req: Request, res: Response) => {
  try {
    const areas = await Area.find().sort({ createdAt: -1 });
    if (!areas || areas.length === 0) {
      errorResponse({
        res,
        message: "No areas found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "Areas fetched successfully",
      data: areas,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error fetching areas",
      statusCode: 500,
      error: error instanceof Error ? error : "Unknown error",
    });
    return;
  }
});

const createArea = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name } = req.body.data;

    if (!name) {
      errorResponse({
        res,
        message: "Area Name is required",
        statusCode: 400,
      });
      return;
    }

    const newArea = new Area({ name });
    await newArea.save();

    successResponse({
      res,
      message: "Area created successfully",
      data: newArea,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error creating area",
      statusCode: 500,
      error: error instanceof Error ? error : "Unknown error",
    });
    return;
  }
});

const deleteArea = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      errorResponse({
        res,
        message: "Area ID is required",
        statusCode: 400,
      });
      return;
    }

    const area = await Area.findById(id);
    if (!area) {
      errorResponse({
        res,
        message: "Area not found",
        statusCode: 404,
      });
      return;
    }
    const areaMeals = await Meal.find({
      area: id,
    });
    if (areaMeals.length > 0) {
      errorResponse({
        res,
        message: "Cannot delete area with associated meals",
        statusCode: 400,
      });
      return;
    }

    await Area.findByIdAndDelete(id);

    successResponse({
      res,
      message: "Area deleted successfully",
      data: area,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error deleting area",
      statusCode: 500,
      error: error instanceof Error ? error : "Unknown error",
    });
    return;
  }
});

const updateArea = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body.data;

    if (!id) {
      errorResponse({
        res,
        message: "Area ID is required",
        statusCode: 400,
      });
      return;
    }

    const area = await Area.findById(id);
    if (!area) {
      errorResponse({
        res,
        message: "Area not found",
        statusCode: 404,
      });
      return;
    }

    area.name = name;
    await area.save();

    successResponse({
      res,
      message: "Area updated successfully",
      data: area,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error updating area",
      statusCode: 500,
      error: error instanceof Error ? error : "Unknown error",
    });
    return;
  }
});

export { getAllAreas, createArea, deleteArea, updateArea };
