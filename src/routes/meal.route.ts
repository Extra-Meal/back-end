import express from "express";
import { validate } from "../middlewares/validation";
import { MealInputSchema } from "../Schemas/meal.schema";
import { getAllMeals } from "../controllers/meal.controller";
const router = express.Router();

router.get("/", getAllMeals);

export default router;
