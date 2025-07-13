import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { errorResponse, successResponse } from "../shared/response";
import { Product } from "../models/product.model";
import { PipelineStage } from "mongoose";
import { Types } from "mongoose";
import Meal from "../models/meal.model";
import { IngredientModel } from "../models/ingredient.model";
import { z } from "zod";
import { productTypeIngredientSchema } from "../Schemas/product.schema";

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
      .populate({
        path: "meal",
        populate: [{ path: "area" }, { path: "category" }],
      });
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
  filter.type = "ingredient";
  const pipeline: PipelineStage[] = [
    { $match: filter },
    {
      $lookup: {
        from: "ingredients",
        localField: "ingredient",
        foreignField: "_id",
        as: "ingredient",
      },
    },
    { $unwind: "$ingredient" },
  ];
  if (req.query.ingredientType) {
    pipeline.push({
      $match: { "ingredient.type": req.query.ingredientType },
    });
  }
  try {
    const totalProducts = await Product.aggregate([...pipeline, { $count: "total" }]);

    pipeline.push({ $sort: { createdAt: 1 } }, { $skip: skip }, { $limit: limit });
    const products = await Product.aggregate(pipeline);

    const totalPages = Math.ceil((totalProducts[0].total || 0) / limit);
    successResponse({
      res,
      message: "Ingredient products fetched successfully",
      data: {
        products,
        pagination: {
          page,
          limit,
          totalPages,
          totalProducts: totalProducts[0].total || 0,
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
  console.log("🚀 ~ getProductById ~ id:", id);

  if (!id) {
    errorResponse({
      res,
      message: "No product ID provided",
      statusCode: 400,
    });
    return;
  }

  try {
    const product = await Product.findById(id)
      .populate("ingredient")
      .populate({
        path: "meal",
        populate: [{ path: "area" }, { path: "category" }, { path: "ingredients.ingredient" }],
      });
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
const getProductTypeIngredientById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log("🚀 ~ getProductById ~ id:", id);

  if (!id) {
    errorResponse({
      res,
      message: "No product ID provided",
      statusCode: 400,
    });
    return;
  }

  try {
    const product = await Product.findOne({
      type: "ingredient",
      ingredient: id,
    })
      .populate("ingredient")
      .populate({
        path: "meal",
        populate: [{ path: "area" }, { path: "category" }, { path: "ingredients.ingredient" }],
      });
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

export type MealIngredientInput = {
  ingredient: string;
  measure: string;
};

export type MealInput = {
  name: string;
  thumbnail?: string;
  category: string;
  area: string;
  instructions?: string;
  tags?: string[];
  youtube?: string;
  source?: string;
  ingredients: MealIngredientInput[];
  preparationTime?: number;
  difficulty?: "easy" | "medium" | "hard";
};
export type CreateProductInput = {
  name: string;
  type: "ingredient" | "kit";
  price: number;
  stock?: number;
  image?: string;
  visible?: boolean;
  sold?: number;
  views?: number;
  discount?: number;
  ratingAverage?: number;
  ratingCount?: number;
  ingredient?: string;
  meal?: MealInput | undefined;
};

const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { data } = req.body;
  const {
    name,
    type,
    price,
    stock,
    image,
    visible,
    sold,
    views,
    discount,
    ratingAverage,
    ratingCount,
    ingredient,
    meal,
  }: CreateProductInput & { ingredient?: string } = data;

  console.log(req.body);

  if (!name || !type || !price) {
    errorResponse({
      res,
      message: "Missing required product fields (name, type, or price)",
      statusCode: 400,
    });
    return;
  }

  try {
    let ingredientId: string | undefined;
    let mealId: string | undefined;

    if (type === "ingredient") {
      if (!ingredient) {
        errorResponse({
          res,
          message: "Missing ingredient reference for ingredient-type product",
          statusCode: 400,
        });
        return;
      }

      const existingIngredient = await IngredientModel.findById(ingredient);
      if (!existingIngredient) {
        errorResponse({
          res,
          message: "Provided ingredient not found",
          statusCode: 404,
        });
        return;
      }

      ingredientId = existingIngredient._id.toString();
    }

    if (type === "kit") {
      if (!meal) {
        errorResponse({
          res,
          message: "Missing meal data for kit-type product",
          statusCode: 400,
        });
        return;
      }
      console.log(meal);
      const newMeal = new Meal(meal);
      const savedMeal = await newMeal.save();
      console.log("Saved Meal:", savedMeal);
      mealId = (savedMeal._id as string | Types.ObjectId).toString();
    }

    const newProduct = new Product({
      name,
      type,
      ingredient: ingredientId,
      meal: mealId,
      price,
      stock: stock ?? 0,
      image,
      visible: visible ?? true,
      sold: sold ?? 0,
      views: views ?? 0,
      discount: discount ?? 0,
      ratingAverage: ratingAverage ?? 0,
      ratingCount: ratingCount ?? 0,
    });

    const savedProduct = await newProduct.save();

    if (mealId) {
      await Meal.findByIdAndUpdate(mealId, {
        kitProduct: savedProduct._id,
      });
    }

    successResponse({
      res,
      message: "Product created successfully",
      data: savedProduct,
      statusCode: 201,
    });
    return;
  } catch (error) {
    console.error("Error creating product:", error);
    errorResponse({
      res,
      message: "Error creating product",
      statusCode: 500,
    });
    return;
  }
});

const createProductTypeIngredient = asyncHandler(async (req: Request, res: Response) => {
  const data: z.infer<typeof productTypeIngredientSchema> = req.body;
  const image = req.file?.path;

  if (!data.name || !data.type || !data.price) {
    errorResponse({
      res,
      message: "Missing required product fields (name, type, or price)",
      statusCode: 400,
    });
    return;
  }

  try {
    const newIngredient = new IngredientModel({
      name: data.name,
      description: data.description,
      type: data.type,
    });
    const savedIngredient = await newIngredient.save();

    const newProduct = new Product({
      name: data.name,
      type: "ingredient",
      ingredient: savedIngredient._id,
      price: data.price,
      stock: data.stock ?? 0,
      image: image,
    });

    const savedProduct = await newProduct.save();

    successResponse({
      res,
      message: "Product created successfully",
      data: savedProduct,
      statusCode: 201,
    });
    return;
  } catch (error) {
    console.error("Error creating product:", error);
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
  const {
    name,
    type,
    ingredient,
    meal,
    price,
    stock,
    image,
    visible,
    sold,
    views,
    discount,
    ratingAverage,
    ratingCount,
  }: Partial<CreateProductInput> = req.body;

  if (!id) {
    errorResponse({
      res,
      message: "No product ID provided",
      statusCode: 400,
    });
    return;
  }

  try {
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      errorResponse({
        res,
        message: "Product not found",
        statusCode: 404,
      });
      return;
    }
    let ingredientId: Types.ObjectId | string | undefined;
    let mealId: Types.ObjectId | undefined;

    if (type === "ingredient") {
      if (!ingredient) {
        errorResponse({
          res,
          message: "Missing ingredient reference for ingredient-type product",
          statusCode: 400,
        });
        return;
      }

      const existingIngredient = await IngredientModel.findById(ingredient);
      if (!existingIngredient) {
        errorResponse({
          res,
          message: "Provided ingredient not found",
          statusCode: 404,
        });
        return;
      }

      ingredientId = existingIngredient._id.toString();
      mealId = undefined;
    }

    if (type === "kit") {
      if (meal) {
        const newMeal = new Meal(meal);
        const savedMeal = await newMeal.save();
        mealId = savedMeal._id as Types.ObjectId;

        await Meal.findByIdAndUpdate(mealId, {
          kitProduct: existingProduct._id,
        });

        ingredientId = undefined;
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: name ?? existingProduct.name,
        type: type ?? existingProduct.type,
        price: price ?? existingProduct.price,
        stock: stock ?? existingProduct.stock,
        image: image ?? existingProduct.image,
        visible: visible ?? existingProduct.visible,
        sold: sold ?? existingProduct.sold,
        views: views ?? existingProduct.views,
        discount: discount ?? existingProduct.discount,
        ratingAverage: ratingAverage ?? existingProduct.ratingAverage,
        ratingCount: ratingCount ?? existingProduct.ratingCount,
        ingredient: ingredientId,
        meal: mealId,
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
    console.error("Error updating product:", error);
    errorResponse({
      res,
      message: "Error updating product",
      statusCode: 500,
    });
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

    if (product.type === "kit" && product.meal) {
      await Meal.findByIdAndDelete(product.meal);
    }

    await Product.findByIdAndDelete(id);

    successResponse({
      res,
      message: "Product deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    errorResponse({
      res,
      message: "Error deleting product",
      statusCode: 500,
    });
  }
});

export {
  getAllProducts,
  getProductsTypeKit,
  getProductsTypeIngredient,
  getProductById,
  getProductsByName,
  getProductTypeIngredientById,
  createProductTypeIngredient,
  createProduct,
  updateProduct,
  deleteProduct,
};
