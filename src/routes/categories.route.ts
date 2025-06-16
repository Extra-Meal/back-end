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
import { rolesMiddleware } from "../middlewares/roles";
import { authMiddleware } from "../middlewares/auth";
const router = express.Router();

router.get("/category", getAllCategories);
router.post("/category", authMiddleware, rolesMiddleware("admin"), validate(categorySchema), createCategory);
router.get("/category/name/:name", getCategoryByName);
router.get("/category/:id", getCategoryById);
router.patch(
  "/category/:id",
  authMiddleware,
  rolesMiddleware("admin"),
  validate(categorySchema.partial()),
  updateCategory
);
router.delete("/category/:id", authMiddleware, rolesMiddleware("admin"), deleteCategory);

export default router;
