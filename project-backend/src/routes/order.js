import express from "express";
import {
  createOrder,
  confirmPayment,
  cancelOrder,
  getUserOrders,
} from "../mongodb/collections/orderColl.js";

const router = express.Router();

router.post("/", createOrder); // call when checkout
router.post("/:orderId/confirm", confirmPayment); // Confirm payment & deduct stock
router.delete("/:orderId", cancelOrder); // Cancel pending order
router.get("/", getUserOrders); // Get user's order history

export default router;
