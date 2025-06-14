import express from "express";
import { validate } from "../middlewares/validation";
import { IngredientSchema } from "../Schemas/ingredient.schema";
import {
  getAllIngredients,
  getIngredientById,
  getIngredientByName,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "../controllers/ingredient.controller";
const router = express.Router();

router.get("/", getAllIngredients);
router.get("/:id", getIngredientById);
router.get("/name/:name", getIngredientByName);
router.post("/", validate(IngredientSchema), createIngredient);
router.put("/:id", validate(IngredientSchema.partial()), updateIngredient);
router.delete("/:id", deleteIngredient);

export default router;
