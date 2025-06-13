import express from "express";
import { validate } from "../middlewares/validation";
import { MealInputSchema } from "../Schemas/meal.schema";
const router = express.Router();

export default router;
