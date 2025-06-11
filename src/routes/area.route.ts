import express from "express";

import { validate } from "../middlewares/validation";
import { deleteArea, getAllAreas, updateArea } from "../controllers/area.controller";
import { areaSchema } from "../Schemas/area.schema";
const router = express.Router();

router.get("/area", getAllAreas);
router.post("/area", validate(areaSchema), getAllAreas);
router.delete("/area/:id", deleteArea);
router.patch("/area/:id", validate(areaSchema), updateArea);

export default router;
