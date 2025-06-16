import { Router } from "express";
import { validate } from "../middlewares/validation";
import { getWishlistItems, addToWishlist, removeFromWishlist, clearWishlist } from "../controllers/wishList.controller";
import { wishlistItemSchema } from "../Schemas/user.schema";

const router = Router();

// Route to get all items in the wishlist
router.get("/", getWishlistItems);
// Route to add an item to the wishlist
router.post("/", validate(wishlistItemSchema), addToWishlist);
// Route to remove an item from the wishlist
router.delete("/", validate(wishlistItemSchema), removeFromWishlist);
// Route to clear the wishlist
router.delete("/clear", clearWishlist);

export default router;
