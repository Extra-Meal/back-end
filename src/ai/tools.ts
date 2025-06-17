import { z } from "zod";
import { tool } from "ai";
import Area from "../models/area.model";
import Category from "../models/category.model";
import { IngredientModel } from "../models/ingredient.model";
import Meal from "../models/meal.model";
import { Product } from "../models/product.model";
import { formatIngredientCard, formatKitCard, formatMealCard } from "./helper";
import { IMeal } from "../types/meal.type";

// 1. Get full meal details
export async function getMealDetails(args: { mealId: string }, _options?: any) {
  console.log("tool call: Fetching meal details for ID:", args.mealId);
  const meal = await Meal.findById(args.mealId).populate("category area kitProduct ingredients.ingredient").lean();

  if (!meal) return null;

  return {
    name: meal.name,
    thumbnail: meal.thumbnail,
    category: meal.category?.name,
    area: meal.area?.name,
    instructions: meal.instructions,
    tags: meal.tags,
    youtube: meal.youtube,
    source: meal.source,
    ingredients: meal.ingredients.map((item: any) => ({
      ingredientId: item.ingredient._id,
      name: item.ingredient.name,
      measure: item.measure,
      image: item.ingredient.image,
    })),
    kitProductId: meal.kitProduct?._id,
    price: meal.kitProduct?.price,
  };
}

// 2. List meals with optional filters
export async function listMeals({
  categoryId,
  areaId,
  search,
}: {
  categoryId?: string;
  areaId?: string;
  search?: string;
}) {
  console.log("tool call: Listing meals with filters:", { categoryId, areaId, search });
  const query: any = {};
  if (categoryId) query.category = categoryId;
  if (areaId) query.area = areaId;
  if (search) query.name = { $regex: search, $options: "i" };

  const meals = await Meal.find(query).select("_id name thumbnail").lean();
  return meals.map((meal) => ({
    mealId: meal._id,
    name: meal.name,
    thumbnail: meal.thumbnail,
  }));
}

// 3. Find meals by ingredients
export async function findMealsByIngredients(args: { ingredientIds: string[] }, _options?: any) {
  console.log("tool call: Finding meals by ingredients:", args.ingredientIds);
  const { ingredientIds } = args;
  const meals = await Meal.find({
    "ingredients.ingredient": { $in: ingredientIds },
  })
    .populate("ingredients.ingredient")
    .lean();

  return meals
    .map((meal) => {
      const matched = meal.ingredients.filter((i: any) => ingredientIds.includes(i.ingredient._id.toString()));
      const matchPercentage = Math.round((matched.length / meal.ingredients.length) * 100);

      return {
        mealId: meal._id,
        name: meal.name,
        thumbnail: meal.thumbnail,
        matchPercentage,
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}

// 4. Get ingredient details
export async function getIngredientDetails(args: { ingredientId: string }, _options?: any) {
  console.log("tool call: Fetching ingredient details for ID:", args.ingredientId);
  const ingredient = await IngredientModel.findById(args.ingredientId).lean();

  if (!ingredient) return null;

  const product = await Product.findOne({ ingredient: args.ingredientId }).lean();

  return {
    name: ingredient.name,
    description: ingredient.description,
    image: ingredient.image,
    type: ingredient.type,
    price: product?.price,
    stock: product?.stock,
  };
}

// 5. List ingredients (optional filters)
export async function listIngredients({ search, type }: { search?: string; type?: string }) {
  console.log("tool call: Listing ingredients with filters:", { search, type });
  const query: any = {};
  if (search) query.name = { $regex: search, $options: "i" };
  if (type) query.type = type;

  const ingredients = await IngredientModel.find(query).lean();

  const products = await Product.find({ type: "ingredient" }).lean();
  const priceMap = Object.fromEntries(products.map((p) => [p.ingredient?.toString(), p]));

  return ingredients.map((ingredient) => {
    const product = priceMap[ingredient._id.toString()];
    return {
      ingredientId: ingredient._id,
      name: ingredient.name,
      image: ingredient.image,
      price: product?.price,
      stock: product?.stock,
    };
  });
}

// 6. Get all categories
export async function getCategories() {
  console.log("tool call: Fetching all categories");
  const categories = await Category.find().lean();
  return categories.map((cat) => ({
    categoryId: cat._id,
    name: cat.name,
    thumbnail: cat.thumbnail,
  }));
}

// 7. Get all areas
export async function getAreas() {
  console.log("tool call: Fetching all areas (cuisines)");
  const areas = await Area.find().lean();
  return areas.map((area) => ({
    areaId: area._id,
    name: area.name,
  }));
}

// 8. get all products
export async function getAllProducts() {
  console.log("tool call: fetch all products");
  const products = await await Product.find().populate([
    {
      path: "ingredient",
    },
    {
      path: "meal",
    },
  ]);
  return products.map((product) => ({
    productId: product._id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    meal: product.meal,
    ingredient: product.ingredient,
    type: product.type,
    image: product.image,
  }));
}

// 9. get product with the type
export async function getAllProductsByType({ type }: { type: "ingredient" | "kit" }) {
  console.log("tool call: fetch all products by type:", type);
  const products = await Product.find({ type })
    .populate(type === "ingredient" ? "ingredient" : "meal")
    .lean();
  return products.map((product) => ({
    productId: product._id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    type: product.type,
    image: product.image,
    ingredient: type === "ingredient" ? product.ingredient : null,
    meal: type === "kit" ? product.meal : null,
  }));
}
export const getMealDetailsFormatted = tool({
  description: "Get formatted information about a meal",
  parameters: z.object({
    mealId: z.string(),
  }),
  execute: async ({ mealId }: { mealId: string }) => {
    const meal = await Meal.findById(mealId).populate("category").populate("area").populate("kitProduct");
    if (!meal) throw new Error("Meal not found");
    // Ensure the types match what formatMealCard expects
    return formatMealCard(meal);
  },
});

export const getIngredientDetailsFormatted = tool({
  description: "Get formatted information about an ingredient",
  parameters: z.object({
    ingredientId: z.string(),
  }),
  execute: async ({ ingredientId }: { ingredientId: string }) => {
    const ingredient = await IngredientModel.findById(ingredientId).lean();
    if (!ingredient) throw new Error("Ingredient not found");
    return formatIngredientCard({ ...ingredient, _id: ingredient._id.toString() });
  },
});

export const getKitDetailsFormatted = tool({
  description: "Get formatted information about a product kit",
  parameters: z.object({
    productId: z.string(),
  }),
  execute: async ({ productId }: { productId: string }) => {
    const product = await Product.findById(productId).populate("meal").lean();
    if (!product) throw new Error("Product not found");
    const meal = product.meal as IMeal;
    return formatKitCard(product);
  },
});

export const tools = {
  getMealDetails: tool({
    description:
      "Fetch full information about a specific meal, including recipe steps, ingredients, and the linked product kit if available.",
    parameters: z.object({
      mealId: z.string().describe("The ID of the meal to fetch."),
    }),
    execute: getMealDetails,
  }),

  listMeals: tool({
    description: "List meals with optional filters for category, area (cuisine), or a search string in the meal name.",
    parameters: z.object({
      categoryId: z.string().describe("Filter by category ID (optional).").optional(),
      areaId: z.string().describe("Filter by cuisine area ID (optional).").optional(),
      search: z.string().describe("Search text to match meal names (optional).").optional(),
    }),
    execute: listMeals,
  }),

  findMealsByIngredients: tool({
    description: "Suggest meals based on a list of ingredient IDs. Returns meals ranked by how many ingredients match.",
    parameters: z.object({
      ingredientIds: z.array(z.string()).describe("Array of ingredient IDs the user has."),
    }),
    execute: findMealsByIngredients,
  }),

  getIngredientDetails: tool({
    description:
      "Fetch detailed information about a specific ingredient, including its name, description, image, type, and store product info.",
    parameters: z.object({
      ingredientId: z.string().describe("The ID of the ingredient to fetch."),
    }),
    execute: getIngredientDetails,
  }),

  listIngredients: tool({
    description:
      "List ingredients optionally filtered by search term or type (e.g., 'Spice', 'Vegetable'). Includes linked product info.",
    parameters: z.object({
      search: z.string().describe("Text to match in ingredient names (optional).").optional(),
      type: z.string().describe("Ingredient type to filter by (optional).").optional(),
    }),
    execute: listIngredients,
  }),

  getCategories: tool({
    description: "Get all available meal categories, including their names and thumbnails.",
    parameters: z.object({}),
    execute: getCategories,
  }),

  getAreas: tool({
    description: "Get all available cuisine areas (e.g., Italian, Egyptian, Japanese).",
    parameters: z.object({}),
    execute: getAreas,
  }),

  getAllProducts: tool({
    description: "Get all Available products(meals or ingredients) with their prices and stoke count",
    parameters: z.object({}),
    execute: getAllProducts,
  }),

  getProductsByType: tool({
    description:
      "Get all Available products based on their type (kit(meals) or ingredients) with their prices and stoke count",
    parameters: z.object({
      type: z.enum(["kit", "ingredient"]),
    }),
    execute: getAllProductsByType,
  }),
  getMealDetailsFormatted,
  getIngredientDetailsFormatted,
  getKitDetailsFormatted,
};
