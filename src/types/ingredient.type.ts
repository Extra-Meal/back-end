import { z } from "zod";
import { IngredientSchema } from "../Schemas/ingredient.schema";
import { ingredientTypes } from "../shared/constants";
export type IngredientType = (typeof ingredientTypes)[number];

export type IIngredient = z.infer<typeof IngredientSchema>;

export interface IIngredientModel extends Document, IIngredient {}
