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
const router = Router();
const uploader = createUploadMiddleware("users");

// Route to get all users
router.get("/", getAllUsers);

// Route to get user by ID
router.get("/:id", getUserById);

// Route to get user by email
router.get("/email/:email", getUserByEmail);

// Route to get current user's data
router.get("/me", getMydata);
// Route to update user roles
router.patch("/:id/roles", updateUserRoles);

// Route to update user data
router.patch("/:id", uploader.single("avatar"), validate(userSchema), updateUser);

// Route to delete user
router.delete("/:id", deleteUser);

// Route to change user avatar
router.patch("/:id/avatar", uploader.single("avatar"), changeUserAvatar);

export default router;
