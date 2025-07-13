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
import { createUploadMiddleware } from "../middlewares/uploudImageGenerator";
const router = express.Router();
const uploader = createUploadMiddleware("category");

router.get("/", getAllCategories);
router.post(
  "/",

  uploader.single("thumbnail"),
  validate(categorySchema.omit({ thumbnail: true })),
  createCategory
);
router.get("/name/:name", getCategoryByName);
router.get("/:id", getCategoryById);
router.patch("/:id", uploader.single("thumbnail"), validate(categorySchema.partial()), updateCategory);
router.delete("/:id",  deleteCategory);

export default router;
