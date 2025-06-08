import mongoose, { Schema } from "mongoose";
import { IReview } from "../types/review.type";

const reviewSchema = new Schema<IReview>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    description: { type: String, required: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    user_id: { type: Schema.Types.ObjectId, ref: "User" }, // Optional: to track who submitted the review
  },
  { timestamps: true }
);

const Review = mongoose.model<IReview>("Review", reviewSchema);
export default Review;
