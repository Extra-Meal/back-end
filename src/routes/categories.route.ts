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

router.get("/", getAllCategories);
router.post("/", authMiddleware, rolesMiddleware("admin"), validate(categorySchema), createCategory);
router.get("/name/:name", getCategoryByName);
router.get("/:id", getCategoryById);
router.patch("/:id", authMiddleware, rolesMiddleware("admin"), validate(categorySchema.partial()), updateCategory);
router.delete("/:id", authMiddleware, rolesMiddleware("admin"), deleteCategory);

export default router;
