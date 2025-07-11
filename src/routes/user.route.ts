import { Router } from "express";
import { createUploadMiddleware } from "../middlewares/uploudImageGenerator";
import {
  updateUser,
  deleteUser,
  getUserById,
  getAllUsers,
  getUserByEmail,
  getMydata,
  updateUserRoles,
  changeUserAvatar,
} from "../controllers/user.controller";
import { validate } from "../middlewares/validation";
import { userSchema } from "../Schemas/user.schema";
import { rolesMiddleware } from "../middlewares/roles";
import { authMiddleware } from "../middlewares/auth";
import { ownerMiddleware } from "../middlewares/owner";
const router = Router();
const uploader = createUploadMiddleware("users");

// Route to get all users
router.get("/", authMiddleware, rolesMiddleware("admin"), getAllUsers);

// Route to get user by email
router.get("/email/:email", authMiddleware, rolesMiddleware("admin"), getUserByEmail);

// Route to get current user's data
router.get("/me", authMiddleware, rolesMiddleware("user", "admin"), getMydata);
// Route to update user roles
router.patch("/:id/roles", authMiddleware, rolesMiddleware("admin"), updateUserRoles);
// Route to get user by ID
router.get("/:id", authMiddleware, rolesMiddleware("admin"), getUserById);
// Route to update user data
router.patch("/:id", authMiddleware, ownerMiddleware, uploader.single("avatar"), validate(userSchema), updateUser);

// Route to delete user
router.delete("/:id", authMiddleware, rolesMiddleware("admin"), deleteUser);

// Route to change user avatar
router.patch("/:id/avatar", authMiddleware, ownerMiddleware, uploader.single("avatar"), changeUserAvatar);

export default router;
