/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events for payment confirmation
 * This ensures order confirmation even if user closes browser after payment
 */
import { stripe } from "../../server.js";
import Order from "../mongodb/models/Order.js";
//import User from "../mongodb/models/User.js";
import { confirmPaymentInternal } from "../mongodb/collections/orderColl.js";
//import { sendOrderConfirmationEmail } from "../mail/nodemailer.js";

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
    //console.log(`Webhook verified: ${event.type}`);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle payment_intent.succeeded event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    //console.log(`Payment succeeded for order: ${orderId}`);

    // Check if already paid (idempotency)
    const order = await Order.findById(orderId).lean().exec();
    const io = req.app.get("io");

    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return res.json({ received: true, error: "Order not found" });
    }

    if (order.status === "paid") {
      console.log(`✓ Order ${orderId} already confirmed, skipping`);
      return res.json({ received: true, skipped: true });
    }

    try {
      // Confirm order (updates status, deducts stock, clears cart)
      const confirmedOrder = await confirmPaymentInternal(orderId);

      // Emit WebSocket event to notify user
      if (io) {
        io.to(order.userId.toString()).emit("orderConfirmed", {
          orderId: confirmedOrder._id,
          status: "paid",
          paidAt: confirmedOrder.paidAt,
        });
        console.log(`WebSocket event sent to user ${order.userId}`);
      }

      console.log(`Order ${orderId} confirmed successfully`);

      // Send order confirmation email
      // const userEmail = await User.findById(confirmedOrder.userId).lean().exec()
      //   .email;
      // const itemsList = confirmedOrder.items
      //   .map(
      //     (item) => `${item.quantity} x ${item.name} @ HKD ${item.price} each`
      //   )
      //   .join("\n");
      // const orderDetails = `Order ID: ${confirmedOrder._id}\nTotal Amount: ${confirmedOrder.orderTotal}\n\nThank you for shopping with us!`;

      // sendOrderConfirmationEmail(userEmail, orderDetails);

      res.json({ received: true });
    } catch (err) {
      console.error("Webhook order confirmation error:", err);

      // Issue refund since order couldn't be fulfilled
      try {
        await stripe.refunds.create({
          payment_intent: paymentIntent.id,
          reason: "requested_by_customer",
        });
        console.log(`Refund issued for order ${orderId}: ${err.message}`);

        // Update order status to refunded
        await Order.findByIdAndUpdate(orderId, {
          status: "refunded",
          refundReason: err.message,
          refundedAt: new Date(),
        });

        // Notify user via WebSocket
        if (io) {
          io.to(order.userId.toString()).emit("orderFailed", {
            orderId,
            reason: err.message,
            refunded: true,
          });
          console.log(`Order failed event sent to user ${order.userId}`);
        }

        res.json({ received: true, error: err.message, refunded: true });
      } catch (refundErr) {
        console.error("Refund failed:", refundErr);
        // Alert admin for manual intervention (could add email/slack notification here)
        res.json({
          received: true,
          error: err.message,
          refundError: refundErr.message,
        });
      }
    }
  } else {
    // Other event types
    console.log(`Unhandled event type: ${event.type}`);
    res.json({ received: true });
  }
};
