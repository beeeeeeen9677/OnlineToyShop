/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events for payment confirmation
 * This ensures order confirmation even if user closes browser after payment
 */
import { stripe } from "../../server.js";

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).send("Webhook secret not configured");
  }

  let event;
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log(`Webhook verified: ${event.type}`);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle payment_intent.succeeded event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    console.log(`💳 Payment succeeded for order: ${orderId}`);

    try {
      // Import Order model and confirmation logic
      const Order = (await import("../mongodb/models/Order.js")).default;
      const { confirmPaymentInternal } = await import(
        "../mongodb/collections/orderColl.js"
      );

      // Check if already paid (idempotency)
      const order = await Order.findById(orderId).lean().exec();

      if (!order) {
        console.error(`Order not found: ${orderId}`);
        return res.json({ received: true, error: "Order not found" });
      }

      if (order.status === "paid") {
        console.log(`✓ Order ${orderId} already confirmed, skipping`);
        return res.json({ received: true, skipped: true });
      }

      // Confirm order (updates status, deducts stock, clears cart)
      const confirmedOrder = await confirmPaymentInternal(orderId);

      // Emit WebSocket event to notify user
      const io = req.app.get("io");
      if (io) {
        io.to(order.userId.toString()).emit("orderConfirmed", {
          orderId: confirmedOrder._id,
          status: "paid",
          paidAt: confirmedOrder.paidAt,
        });
        console.log(`WebSocket event sent to user ${order.userId}`);
      }

      console.log(`Order ${orderId} confirmed successfully`);
      res.json({ received: true });
    } catch (err) {
      console.error("Webhook order confirmation error:", err);
      // Still return 200 to acknowledge receipt (Stripe requirement)
      res.json({ received: true, error: err.message });
    }
  } else {
    // Other event types
    console.log(`Unhandled event type: ${event.type}`);
    res.json({ received: true });
  }
};
