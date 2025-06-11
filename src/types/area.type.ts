import { z } from "zod";
import { areaSchema } from "../Schemas/area.schema";
import { Document } from "mongoose";

export type IArea = z.infer<typeof areaSchema>;

export interface IAreaModel extends Document, IArea {}
