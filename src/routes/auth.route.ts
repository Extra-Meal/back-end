import express from "express";
import { loginUser, registerNewUser, googleLogin } from "../controllers/auth.controller";
const router = express.Router();

router.post("/register", registerNewUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);

export default router;
