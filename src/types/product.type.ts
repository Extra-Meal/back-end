import { Document, Types } from "mongoose";
import { z } from "zod";
import { productSchema } from "../Schemas/product.schema";

export type IProduct = z.infer<typeof productSchema>;

export interface IProductModel extends Document, IProduct {}
