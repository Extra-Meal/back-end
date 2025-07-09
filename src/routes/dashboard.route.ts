// routes/dashboard.ts
import express from "express";
import { getDashboardData } from "../controllers/dashboard.controller";
import { rolesMiddleware } from "../middlewares/roles";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

router.get("/", authMiddleware, rolesMiddleware("admin"), getDashboardData);

export default router;
