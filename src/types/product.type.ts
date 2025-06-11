import { Document, Types } from "mongoose";
import { z } from "zod";
import { ProductSchema } from "../Schemas/product.schema";

export type IProduct = z.infer<typeof ProductSchema>;

export interface IProductModel extends Document, IProduct {}
