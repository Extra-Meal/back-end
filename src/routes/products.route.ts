import express from "express";
import { validate } from "../middlewares/validation";
import { productSchema, productTypeIngredientSchema } from "../Schemas/product.schema";
import {
  getAllProducts,
  getProductsTypeKit,
  getProductsTypeIngredient,
  getProductById,
  getProductsByName,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductTypeIngredientById,
  createProductTypeIngredient,
} from "../controllers/products.controller";
import { createUploadMiddleware } from "../middlewares/uploudImageGenerator";
import { authMiddleware } from "../middlewares/auth";
const router = express.Router();
const ingredientUploader = createUploadMiddleware("ingredient");
const kitUploader = createUploadMiddleware("kit");

router.get("/", getAllProducts);
router.get("/kits", getProductsTypeKit);
router.get("/ingredients", getProductsTypeIngredient);
router.get("/ingredients/:id", getProductTypeIngredientById);
router.get("/name/:name", getProductsByName);
router.post("/", authMiddleware, createProduct);
router.post(
  "/ingredients",
  ingredientUploader.single("image"),
  validate(productTypeIngredientSchema),
  createProductTypeIngredient
);
router.get("/:id", getProductById);
router.put("/:id", validate(productSchema.partial()), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
