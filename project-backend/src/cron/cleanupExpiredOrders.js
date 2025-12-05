import cron from "node-cron";
import Order from "../mongodb/models/Order.js";

// Cleanup expired pending orders (runs every 30 minutes)
export const startOrderCleanup = () => {
  cron.schedule("*/30 * * * *", async () => {
    // minute hour day month weekday
    try {
      const now = new Date();

      // Find and update expired pending orders
      const result = await Order.updateMany(
        {
          status: "pending",
          expiresAt: { $lt: now }, // find expired records
        },
        {
          $set: { status: "expired" },
        }
      ).exec();

      if (result.modifiedCount > 0) {
        console.log(
          `Order Cleanup: Marked ${result.modifiedCount} order(s) as expired`
        );
      }
    } catch (error) {
      console.error("Order Cleanup: Error in cron job:", error);
    }
  });

  console.log("🕐 Order cleanup cron job started (runs every 30 minutes)");
};
