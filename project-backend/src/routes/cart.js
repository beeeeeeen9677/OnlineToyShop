import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
} from "../mongodb/collections/cartColl.js";

const router = express.Router();

// check if user is logged in
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

router.use(requireAuth);

router.get("/", getCart);
router.post("/items", addToCart);
router.put("/items/:goodId", updateCartItem);
router.delete("/items/:goodId", removeFromCart);
router.delete("/", clearCart);
router.post("/sync", syncCart);

export default router;
