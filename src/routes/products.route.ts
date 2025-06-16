import express from "express";
import { validate } from "../middlewares/validation";
import { productSchema } from "../Schemas/product.schema";
import {
  getAllProducts,
  getProductsTypeKit,
  getProductsTypeIngredient,
  getProductById,
  getProductsByName,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller";
const router = express.Router();

router.get("/", getAllProducts);
router.get("/kits", getProductsTypeKit);
router.get("/ingredients", getProductsTypeIngredient);
router.get("/:id", getProductById);
router.get("/name/:name", getProductsByName);
router.post("/", validate(productSchema), createProduct);
router.put("/:id", validate(productSchema.partial()), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
