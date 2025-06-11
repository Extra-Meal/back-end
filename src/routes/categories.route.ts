import express from "express";
import {
  createCategory,
  getAllCategories,
  deleteCategory,
  updateCategory,
  getCategoryById,
  getCategoryByName,
} from "../controllers/categories.controller";
import { validate } from "../middlewares/validation";
import { categorySchema } from "../Schemas/category.schema";
const router = express.Router();

router.get("/category", getAllCategories);
router.post("/category", validate(categorySchema), createCategory);
router.get("/category/name/:name", getCategoryByName);
router.get("/category/:id", getCategoryById);
router.patch("/category/:id", validate(categorySchema.partial()), updateCategory);
router.delete("/category/:id", deleteCategory);

export default router;
