const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      goodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Good",
        required: true,
      },
      name: { type: String, required: true }, // Snapshot
      price: { type: Number, required: true }, // Snapshot
      quantity: { type: Number, required: true },
      imageUrl: { type: String, required: true }, // Snapshot
    },
  ],
  totalAmount: { type: Number, required: true }, // Items total
  shippingFee: { type: Number, required: true }, // 40 HKD
  orderTotal: { type: Number, required: true }, // totalAmount + shippingFee
  status: {
    type: String,
    enum: ["pending", "paid", "expired", "cancelled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now }, // UTC timestamp
  paidAt: { type: Date, default: null }, // null if not paid
  expiresAt: { type: Date, required: true }, // createdAt + 30 min
});

// Index for efficient cleanup query
orderSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model("Order", orderSchema);
