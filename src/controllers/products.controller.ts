import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { errorResponse, successResponse } from "../shared/response";
import { Product } from "../models/product.model";

function filterProducts(query: Record<string, any>): Record<string, any> {
  const filter: Record<string, any> = {};

  if (query.search) {
    const search = query.search;
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }

  if (query.type) {
    const type = query.type;
    if (type === "ingredient" || type === "kit") {
      filter.type = type;
    }
  }

  if (query.minPrice || query.maxPrice) {
    if (!isNaN(query.minPrice) && !isNaN(query.maxPrice)) {
      const minPrice = parseFloat(query.minPrice);
      const maxPrice = parseFloat(query.maxPrice);
      filter.price = { $gte: minPrice, $lte: maxPrice };
    }
  }

  if (query.stock) {
    if (query.stock === "in-stock") {
      filter.stock = { $gt: 0 };
    }
    if (query.stock === "out-of-stock") {
      filter.stock = { $lte: 0 };
    }
  }

  return filter;
}

const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;
  const filter = filterProducts(req.query);

  try {
    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("ingredient")
      .populate("meal");
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    successResponse({
      res,
      message: "Products fetched successfully",
      data: {
        products,
        pagination: {
          page,
          limit,
          totalPages,
          totalProducts,
        },
      },
      statusCode: 200,
    });
  } catch (error) {
    errorResponse({
      res,
      message: "Error fetching products",
      statusCode: 500,
    });
    return;
  }
});

const getProductsTypeKit = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;
  const filter = filterProducts(req.query);
  if (filter.type) {
    delete filter.type;
  }
  try {
    const products = await Product.find({ ...filter, type: "kit" })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("ingredient")
      .populate("meal");
    const totalProducts = await Product.countDocuments({ ...filter, type: "kit" });
    const totalPages = Math.ceil(totalProducts / limit);
    successResponse({
      res,
      message: "Kit products fetched successfully",
      data: {
        products,
        pagination: {
          page,
          limit,
          totalPages,
          totalProducts,
        },
      },
      statusCode: 200,
    });
  } catch (error) {
    errorResponse({
      res,
      message: "Error fetching kit products",
      statusCode: 500,
    });
    return;
  }
});

const getProductsTypeIngredient = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;
  const filter = filterProducts(req.query);
  if (filter.type) {
    delete filter.type;
  }

  try {
    const products = await Product.find({ ...filter, type: "ingredient" })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("ingredient")
      .populate("meal");
    const totalProducts = await Product.countDocuments({ ...filter, type: "ingredient" });
    const totalPages = Math.ceil(totalProducts / limit);
    successResponse({
      res,
      message: "Ingredient products fetched successfully",
      data: {
        products,
        pagination: {
          page,
          limit,
          totalPages,
          totalProducts,
        },
      },
      statusCode: 200,
    });
  } catch (error) {
    errorResponse({
      res,
      message: "Error fetching ingredient products",
      statusCode: 500,
    });
    return;
  }
});

const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    errorResponse({
      res,
      message: "No product ID provided",
      statusCode: 400,
    });
    return;
  }

  try {
    const product = await Product.findById(id).populate("ingredient").populate("meal");
    if (!product) {
      errorResponse({
        res,
        message: "Product not found",
        statusCode: 404,
      });
      return;
    }
    successResponse({
      res,
      message: "Product fetched successfully",
      data: product,
      statusCode: 200,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error fetching product",
      statusCode: 500,
    });
    return;
  }
});

const getProductsByName = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.query;

  if (!name) {
    errorResponse({
      res,
      message: "No product name provided",
      statusCode: 400,
    });
    return;
  }

  try {
    const products = await Product.find({
      name: { $regex: name, $options: "i" },
    })
      .populate("ingredient")
      .populate("meal");

    if (products.length === 0) {
      errorResponse({
        res,
        message: "No products found with that name",
        statusCode: 404,
      });
      return;
    }

    successResponse({
      res,
      message: "Products fetched successfully",
      data: products,
      statusCode: 200,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error fetching products by name",
      statusCode: 500,
    });
    return;
  }
});

const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, type, ingredient, meal, price, stock, image, visible } = req.body;

  if (!name || !type || (type === "ingredient" && !ingredient) || (type === "kit" && !meal) || !price) {
    errorResponse({
      res,
      message: "Missing required fields",
      statusCode: 400,
    });
    return;
  }

  try {
    const newProduct = new Product({
      name,
      type,
      ingredient: type === "ingredient" ? ingredient : undefined,
      meal: type === "kit" ? meal : undefined,
      price,
      stock: stock || 0,
      image,
      visible: visible !== undefined ? visible : true,
    });

    const savedProduct = await newProduct.save();
    successResponse({
      res,
      message: "Product created successfully",
      data: savedProduct,
      statusCode: 201,
    });
  } catch (error) {
    errorResponse({
      res,
      message: "Error creating product",
      statusCode: 500,
    });
    return;
  }
});

const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, type, ingredient, meal, price, stock, image, visible } = req.body;

  if (!id) {
    errorResponse({
      res,
      message: "No product ID provided",
      statusCode: 400,
    });
    return;
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      errorResponse({
        res,
        message: "Product not found",
        statusCode: 404,
      });
      return;
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: name || product.name,
        type: type || product.type,
        ingredient: type === "ingredient" ? ingredient || product.ingredient : product.ingredient,
        meal: type === "kit" ? meal || product.meal : product.meal,
        price: price || product.price,
        stock: stock !== undefined ? stock : product.stock,
        image: image || product.image,
        visible: visible !== undefined ? visible : product.visible,
      },
      { new: true }
    )
      .populate("ingredient")
      .populate("meal");
    successResponse({
      res,
      message: "Product updated successfully",
      data: updatedProduct,
      statusCode: 200,
    });
  } catch (error) {
    errorResponse({
      res,
      message: "Error updating product",
      statusCode: 500,
    });
    return;
  }
});

const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    errorResponse({
      res,
      message: "No product ID provided",
      statusCode: 400,
    });
    return;
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      errorResponse({
        res,
        message: "Product not found",
        statusCode: 404,
      });
      return;
    }
    await Product.findByIdAndDelete(id);
    successResponse({
      res,
      message: "Product deleted successfully",
      statusCode: 200,
    });
    return;
  } catch (error) {
    errorResponse({
      res,
      message: "Error deleting product",
      statusCode: 500,
    });
    return;
  }
});

export {
  getAllProducts,
  getProductsTypeKit,
  getProductsTypeIngredient,
  getProductById,
  getProductsByName,
  createProduct,
  updateProduct,
  deleteProduct,
};
