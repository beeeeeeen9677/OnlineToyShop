import Order from "../models/Order.js";
import Good from "../models/Good.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Create order (checkout) - validates stock, creates pending order
export const createOrder = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { items } = req.body; // items: [{ goodId, quantity }]

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Fetch all goods once
    const goodIds = items.map((item) => item.goodId);
    const goods = await Good.find({ _id: { $in: goodIds } }).exec();

    // Create lookup object
    const goodsMap = {};
    goods.forEach((good) => {
      goodsMap[good._id.toString()] = good;
    });

    // Validate all items
    for (const item of items) {
      const good = goodsMap[item.goodId];

      if (!good) {
        return res
          .status(404)
          .json({ error: `Product not found: ${item.goodId}` });
      }

      if (!good.available) {
        return res
          .status(400)
          .json({ error: `Product unavailable: ${good.name}` });
      }

      if (good.quota < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${good.name}. Available: ${good.quota}`,
        });
      }
    }

    // Create order items with snapshots
    const orderItems = items.map((item) => {
      const good = goodsMap[item.goodId];
      return {
        goodId: item.goodId,
        name: good.name,
        price: good.price,
        quantity: item.quantity,
        shippingDate: good.shippingDate,
        imageUrl: good.imageUrl,
      };
    });

    // Calculate totals
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingFee = 40;
    const orderTotal = totalAmount + shippingFee;

    // expiration time
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 mins

    // Create order
    const order = new Order({
      userId,
      items: orderItems,
      totalAmount,
      shippingFee,
      orderTotal,
      status: "pending",
      createdAt: now,
      expiresAt,
    });

    await order.save();

    res.json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: err.message });
  }
};

// Confirm payment - deduct stock atomically, update to paid
export const confirmPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { orderId } = req.params;
    const userId = req.session.user._id;

    // race condition handling
    session.startTransaction();

    const order = await Order.findOne({ _id: orderId, userId })
      .session(session)
      .exec();

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "pending") {
      throw new Error(`Cannot confirm payment for ${order.status} order`);
    }

    if (order.expiresAt < new Date()) {
      throw new Error("Order has expired");
    }

    // Deduct quota for all items
    for (const item of order.items) {
      const result = await Good.findOneAndUpdate(
        { _id: item.goodId, quota: { $gte: item.quantity } }, // ensure enough quota
        { $inc: { quota: -item.quantity, broughtCount: item.quantity } },
        { session, new: true }
      ).exec();

      if (!result) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
    }

    // Update order status
    order.status = "paid";
    order.paidAt = new Date();
    await order.save({ session });

    // remove purchased items from user's cart after successful payment
    const purchasedGoodIds = order.items.map((item) => item.goodId);
    await User.findByIdAndUpdate(
      userId,
      { $pull: { cart: { goodId: { $in: purchasedGoodIds } } } },
      { session }
    ).exec();

    await session.commitTransaction();
    res.json(order);
  } catch (err) {
    await session.abortTransaction();
    console.error("Error confirming payment:", err);
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
};

// Cancel order (user action, pending only)
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.session.user._id;

    const order = await Order.findOne({ _id: orderId, userId }).exec();

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ error: `Cannot cancel ${order.status} order` });
    }

    order.status = "cancelled";
    await order.save();

    res.json(order);
  } catch (err) {
    console.error("Error cancelling order:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const orders = await Order.find({ userId, status: "paid" })
      .sort({ createdAt: -1 })
      .exec();

    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: err.message });
  }
};
