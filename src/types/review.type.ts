import mongoose, { Document } from "mongoose";
import { z } from "zod";
import { reviewSchema } from "../Schemas/review.schema";

export type IReview = z.infer<typeof reviewSchema>;

export interface IReviewModel extends Document {
  product_id: mongoose.Types.ObjectId;
  description: string;
  rating: number;
  user_id: mongoose.Types.ObjectId;
}
