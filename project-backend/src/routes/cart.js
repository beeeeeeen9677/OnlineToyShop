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

router.get("/", getCart);
router.post("/items", addToCart);
router.put("/items/:goodId", updateCartItem);
router.delete("/items/:goodId", removeFromCart);
router.delete("/", clearCart);
router.post("/sync", syncCart); // call when login

export default router;
