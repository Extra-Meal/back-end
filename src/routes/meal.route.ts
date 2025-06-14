import express from "express";
import { validate } from "../middlewares/validation";
import { MealInputSchema } from "../Schemas/meal.schema";
import {
  getAllMeals,
  getMealById,
  getMealByName,
  createMeal,
  updateMeal,
  deleteMeal,
} from "../controllers/meal.controller";
const router = express.Router();

router.get("/", getAllMeals);
router.get("/:id", getMealById);
router.get("/name/:name", getMealByName);
router.post("/", validate(MealInputSchema), createMeal);
router.put("/:id", validate(MealInputSchema.partial()), updateMeal);
router.delete("/:id", deleteMeal);

export default router;
