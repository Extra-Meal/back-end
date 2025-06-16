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

const router = Router();

// Route to get all items in the cart
router.get("/", getCartItems);
// Route to add an item to the cart
router.post("/", validate(cartItemSchema), addToCart);
// Route to remove an item from the cart
router.delete("/", removeFromCart);
// Route to clear the cart
router.delete("/clear", clearCart);
// Route to update the quantity of an item in the cart
router.patch("/", validate(cartItemSchema), updateCartItemQuantity);

export default router;
