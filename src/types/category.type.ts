import { z } from "zod";
import { categorySchema } from "../Schemas/category.schema";

export type ICategory = z.infer<typeof categorySchema>;
export interface ICategoryModel extends Document, ICategory {}
