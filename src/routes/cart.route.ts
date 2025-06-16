import { Router } from "express";
import { validate } from "../middlewares/validation";
import {
  getCartItems,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartItemQuantity,
} from "../controllers/cart.controller";
import { cartItemSchema } from "../Schemas/cart.schema";
import { rolesMiddleware } from "../middlewares/roles";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// Route to get all items in the cart
router.get("/", authMiddleware, rolesMiddleware("user"), getCartItems);
// Route to add an item to the cart
router.post("/", authMiddleware, rolesMiddleware("user"), validate(cartItemSchema), addToCart);
// Route to remove an item from the cart
router.delete("/", authMiddleware, rolesMiddleware("user"), removeFromCart);
// Route to clear the cart
router.delete("/clear", authMiddleware, rolesMiddleware("user"), clearCart);
// Route to update the quantity of an item in the cart
router.patch("/", authMiddleware, rolesMiddleware("user"), validate(cartItemSchema), updateCartItemQuantity);

export default router;
