import express from "express";

import { validate } from "../middlewares/validation";
import { createArea, deleteArea, getAllAreas, updateArea } from "../controllers/area.controller";
import { areaSchema } from "../Schemas/area.schema";
import { rolesMiddleware } from "../middlewares/roles";
import { authMiddleware } from "../middlewares/auth";
const router = express.Router();

router.get("/area", getAllAreas);
router.post("/area", validate(areaSchema), createArea);
router.delete("/area/:id", authMiddleware, rolesMiddleware("admin"), deleteArea);
router.patch("/area/:id", authMiddleware, rolesMiddleware("admin"), validate(areaSchema), updateArea);

export default router;
