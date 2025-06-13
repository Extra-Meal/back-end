import express from "express";
import { loginUser, registerNewUser, googleLogin, verifyEmail } from "../controllers/auth.controller";
const router = express.Router();

router.post("/register", registerNewUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);
router.post("/verify-email", verifyEmail);

export default router;
