import { Router } from "express";
import { validate } from "../middlewares/validation";
import { getWishlistItems, addToWishlist, removeFromWishlist, clearWishlist } from "../controllers/wishList.controller";
import { wishlistItemSchema } from "../Schemas/user.schema";
import { rolesMiddleware } from "../middlewares/roles";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// Route to get all items in the wishlist
router.get("/", authMiddleware, rolesMiddleware("user"), getWishlistItems);
// Route to add an item to the wishlist
router.post("/", authMiddleware, rolesMiddleware("user"), validate(wishlistItemSchema), addToWishlist);
// Route to remove an item from the wishlist
router.delete("/", authMiddleware, rolesMiddleware("user"), validate(wishlistItemSchema), removeFromWishlist);
// Route to clear the wishlist
router.delete("/clear", authMiddleware, rolesMiddleware("user"), clearWishlist);

export default router;
