import express from "express";
import { validate } from "../middlewares/validation";
import { productSchema } from "../Schemas/product.schema";
const router = express.Router();

export default router;
