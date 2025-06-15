import express from "express";
import { validate } from "../middlewares/validation";
import { reviewSchema } from "../Schemas/review.schema";
import {
  getAllProductReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/review.controller";
const router = express.Router();

router.get("/", getAllProductReviews);
router.get("/:id", getReviewById);
router.post("/", validate(reviewSchema), createReview);
router.put("/:id", validate(reviewSchema.partial()), updateReview);
router.delete("/:id", deleteReview);

export default router;
