import mongoose, { Document } from "mongoose";
import { z } from "zod";
import { reviewSchema } from "../Schemas/review.schema";

export interface IReview extends Document {
  product_id: mongoose.Types.ObjectId;
  description: string;
  rating: number;
  user_id: mongoose.Types.ObjectId;
}

export type ReviewType = z.infer<typeof reviewSchema>;
