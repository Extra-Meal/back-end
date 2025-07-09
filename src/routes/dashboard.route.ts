import express from "express";
import {
  getLowStockProducts,
  getMealDifficultyStats,
  getNewUsersChart,
  getOverviewStats,
  getRevenueLastNDays,
  getTopMeals,
} from "../controllers/dashboard.controller";
import { rolesMiddleware } from "../middlewares/roles";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

router.get("/status", authMiddleware, rolesMiddleware("admin"), getOverviewStats);
router.get("/revenue", authMiddleware, rolesMiddleware("admin"), getRevenueLastNDays);
router.get("/top-meals", authMiddleware, rolesMiddleware("admin"), getTopMeals);
router.get("/meal-difficulty", authMiddleware, rolesMiddleware("admin"), getMealDifficultyStats);
router.get("/low-stock", authMiddleware, rolesMiddleware("admin"), getLowStockProducts);
router.get("/new-users", authMiddleware, rolesMiddleware("admin"), getNewUsersChart);

export default router;
