import { Router } from "express";
import { aiChatHandler } from "../controllers/chat.controller";

const router = Router();

// Define your routes here
router.post("/", aiChatHandler);

export default router;
