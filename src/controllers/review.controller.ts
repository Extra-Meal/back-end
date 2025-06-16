import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { errorResponse, successResponse } from "../shared/response";
import Review from "../models/review.model";

const getAllProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;

  if (!productId) {
    errorResponse({
      res,
      message: "No product ID provided",
      statusCode: 400,
    });
    return;
  }

  try {
    const reviews = await Review.find({ product_id: productId })
      .populate("user_id", "name email")
      .sort({ createdAt: -1 });
    successResponse({
      res,
      message: "Reviews fetched successfully",
      data: reviews,
      statusCode: 200,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error fetching reviews",
      statusCode: 500,
    });
    return;
  }
});

const getReviewById = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;

  if (!reviewId) {
    errorResponse({
      res,
      message: "No review ID provided",
      statusCode: 400,
    });
    return;
  }

  try {
    const review = await Review.findById(reviewId).populate("user", "name email");

    if (!review) {
      errorResponse({
        res,
        message: "Review not found",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "Review fetched successfully",
      data: review,
      statusCode: 200,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error fetching review",
      statusCode: 500,
    });
    return;
  }
});
const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { rating, description } = req.body;

  if (!productId || !rating) {
    errorResponse({
      res,
      message: "Product ID and rating are required",
      statusCode: 400,
    });
    return;
  }

  try {
    const review = new Review({
      product_id: productId,
      user_id: req.user?._id, // Assuming user is set in request by auth middleware
      description,
      rating,
    });

    await review.save();

    successResponse({
      res,
      message: "Review created successfully",
      data: review,
      statusCode: 201,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error creating review",
      statusCode: 500,
    });
    return;
  }
});

const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { rating, description } = req.body;

  if (!reviewId) {
    errorResponse({
      res,
      message: "No review ID provided",
      statusCode: 400,
    });
    return;
  }
  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      errorResponse({
        res,
        message: "Review not found",
        statusCode: 404,
      });
      return;
    }
    if (req.user?._id?.toString() !== review.user_id.toString()) {
      errorResponse({
        res,
        message: "You are not authorized to update this review",
        statusCode: 403,
      });
      return;
    }
    review.rating = rating || review.rating;
    review.description = description || review.description;
    await review.save();
    successResponse({
      res,
      message: "Review updated successfully",
      data: review,
      statusCode: 200,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error fetching review",
      statusCode: 500,
    });
    return;
  }
});

const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;

  if (!reviewId) {
    errorResponse({
      res,
      message: "No review ID provided",
      statusCode: 400,
    });
    return;
  }

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      errorResponse({
        res,
        message: "Review not found",
        statusCode: 404,
      });
      return;
    }
    if (req.user?._id?.toString() !== review.user_id.toString()) {
      errorResponse({
        res,
        message: "You are not authorized to delete this review",
        statusCode: 403,
      });
      return;
    }
    await Review.deleteOne({ _id: reviewId });
    successResponse({
      res,
      message: "Review deleted successfully",
      statusCode: 200,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error deleting review",
      statusCode: 500,
    });
    return;
  }
});

export { getAllProductReviews, getReviewById, createReview, updateReview, deleteReview };
