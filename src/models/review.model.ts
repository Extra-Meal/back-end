import mongoose, { Schema } from "mongoose";
import { IReviewModel } from "../types/review.type";

const reviewSchema = new Schema<IReviewModel>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    description: { type: String, required: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Review = mongoose.model<IReviewModel>("Review", reviewSchema);
export default Review;
