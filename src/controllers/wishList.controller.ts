// wishList.controller.ts
import { Request, Response } from "express";
import User from "../models/user.model";
import asyncHandler from "express-async-handler";
import { errorResponse, successResponse } from "../shared/response";
import { Product } from "../models/product.model";

// Function to get all items in the wishlist
const getWishlistItems = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    errorResponse({
      res,
      message: "You must be logged in to view wishlist items.",
      statusCode: 400,
    });
    return;
  }

  const user = await User.findById(userId).populate("wishlist");
  if (!user) {
    errorResponse({
      res,
      message: "Sorry, we could not find your wishlist.",
      statusCode: 404,
    });
    return;
  }

  successResponse({
    res,
    message: "Wishlist items retrieved successfully.",
    data: user.wishlist,
  });
});

// Function to add an item to the wishlist
const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { productId } = req.body;

  if (!userId) {
    errorResponse({
      res,
      message: "Oops, you must be logged in to add items to the wishlist.",
      statusCode: 400,
    });
    return;
  }
  if (!productId) {
    errorResponse({
      res,
      message: "You didn't select a product to add to the wishlist.",
      statusCode: 400,
    });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    errorResponse({
      res,
      message: "User not found.",
      statusCode: 404,
    });
    return;
  }
  const isProductExists = await Product.findById(productId);
  if (!isProductExists) {
    errorResponse({
      res,
      message: "This product does not exist.",
      statusCode: 404,
    });
    return;
  }
  const isProductInWishlist = user.wishlist.includes(productId);
  if (isProductInWishlist) {
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId.toString());
  } else user.wishlist.push(productId);

  await user.save();

  successResponse({
    res,
    message: `Product ${isProductInWishlist ? "removed from" : "added to"} wishlist successfully.`,
    data: user.wishlist,
  });
});

// Function to remove an item from the wishlist
const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { productId } = req.params;

  if (!userId) {
    errorResponse({
      res,
      message: "You must be logged in to remove items from the wishlist.",
      statusCode: 400,
    });
    return;
  }
  if (!productId) {
    errorResponse({
      res,
      message: "You didn't select a product to remove from the wishlist.",
      statusCode: 400,
    });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    errorResponse({
      res,
      message: "User not found.",
      statusCode: 404,
    });
    return;
  }

  const productIndexInWishlist = user.wishlist.findIndex((item) => item.toString() === productId);
  if (productIndexInWishlist === -1) {
    errorResponse({
      res,
      message: "This product is not in your wishlist.",
      statusCode: 404,
    });
    return;
  }

  user.wishlist.splice(productIndexInWishlist, 1);
  await user.save();

  successResponse({
    res,
    message: "Product removed from wishlist successfully.",
    data: user.wishlist,
  });
});

// Function to clear the wishlist
const clearWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    errorResponse({
      res,
      message: "You must be logged in to clear the wishlist.",
      statusCode: 400,
    });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    errorResponse({
      res,
      message: "User not found.",
      statusCode: 404,
    });
    return;
  }

  user.wishlist = [];
  await user.save();

  successResponse({
    res,
    message: "Wishlist cleared successfully.",
    data: user.wishlist,
  });
});

export { getWishlistItems, addToWishlist, removeFromWishlist, clearWishlist };
