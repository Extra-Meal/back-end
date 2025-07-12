import { Request, Response } from "express";
import User from "../models/user.model";
import asyncHandler from "express-async-handler";
import { errorResponse, successResponse } from "../shared/response";
import { Product } from "../models/product.model";

// Function to get all items in the cart
const getCartItems = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    errorResponse({
      res,
      message: "You must be logged in to view cart items.",
      statusCode: 400,
    });
    return;
  }

  const user = await User.findById(userId).populate("cart.product");
  if (!user) {
    errorResponse({
      res,
      message: "User not found.",
      statusCode: 404,
    });
    return;
  }

  successResponse({
    res,
    message: "Cart items retrieved successfully.",
    data: user.cart,
  });
});

// Function to add an item to the cart
const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { product, quantity } = req.body.data;
  console.log("🚀 ~ addToCart ~ product:", product);

  if (!userId) {
    errorResponse({
      res,
      message: "Oops, you must be logged in to add items to the cart.",
      statusCode: 400,
    });
    return;
  }
  if (!product) {
    errorResponse({
      res,
      message: "You didn't select a product to add to the cart.",
      statusCode: 400,
    });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    errorResponse({
      res,
      message: "Something went wrong, user wasn't found.",
      statusCode: 404,
    });
    return;
  }

  const productExists = await Product.findById(product);
  if (!productExists) {
    errorResponse({
      res,
      message: "This product doesn't exist.",
      statusCode: 404,
    });
    return;
  }
  const productIndexInCart = user.cart.findIndex((item) => item.product.toString() === product);

  if (productIndexInCart !== -1) {
    if (quantity) user.cart[productIndexInCart].quantity += quantity;
    else user.cart[productIndexInCart].quantity += 1; // Default to increasing by 1 if no quantity specified
    await user.save();
    successResponse({
      res,
      message: `${productExists.name} quantity increased by ${quantity || 1}.`,
      data: user.cart,
    });
    return;
  } else {
    console.log("🚀 ~ addToCart ~ user.cart:", user.cart, product);
    user.cart.push({ product, quantity: quantity || 1 }); // Default to 1 if no quantity specified
  }

  await user.save();

  successResponse({
    res,
    message:
      productIndexInCart > -1
        ? `${productExists.name} quantity increased by ${quantity || 1}.`
        : `${productExists.name} added to cart successfully.`,
    data: user.cart,
  });
});

// Function to remove an item from the cart
const removeFromCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { productId } = req.params;

  if (!userId) {
    errorResponse({
      res,
      message: "You must be logged in to remove items from the cart.",
      statusCode: 400,
    });
    return;
  }
  if (!productId) {
    errorResponse({
      res,
      message: "You didn't select a product to remove from the cart.",
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

  const productIndexInCart = user.cart.findIndex((item) => item.product.toString() === productId);
  if (productIndexInCart === -1) {
    errorResponse({
      res,
      message: "This product is not in your cart.",
      statusCode: 404,
    });
    return;
  }

  user.cart.splice(productIndexInCart, 1);
  await user.save();

  successResponse({
    res,
    message: "Product removed from cart successfully.",
    data: user.cart,
  });
});

// Function to clear the cart
const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    errorResponse({
      res,
      message: "You must be logged in to clear the cart.",
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

  user.cart = [];
  await user.save();

  successResponse({
    res,
    message: "Cart cleared successfully.",
    data: user.cart,
  });
});

// Function to update the quantity of an item in the cart
const updateCartItemQuantity = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { product, quantity } = req.body;

  if (!userId) {
    errorResponse({
      res,
      message: "You must be logged in to update cart items.",
      statusCode: 400,
    });
    return;
  }
  if (!product || quantity === undefined) {
    errorResponse({
      res,
      message: "You must provide a product ID and quantity to update the cart.",
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

  const productIndexInCart = user.cart.findIndex((item) => item.product.toString() === product);
  if (productIndexInCart === -1) {
    errorResponse({
      res,
      message: "This product is not in your cart.",
      statusCode: 404,
    });
    return;
  }

  if (quantity <= 0) {
    user.cart.splice(productIndexInCart, 1);
  } else {
    user.cart[productIndexInCart].quantity = quantity;
  }

  await user.save();

  successResponse({
    res,
    message: "Cart item updated successfully.",
    data: user.cart,
  });
});

export { getCartItems, addToCart, removeFromCart, clearCart, updateCartItemQuantity };
