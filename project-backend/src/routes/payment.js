import { Router } from "express";
import Stripe from "stripe";
import Order from "../mongodb/models/Order.js";

const router = Router();

// will be initialized when first request comes in
// ensures .env is loaded first by server.js
let stripe;

const getStripe = () => {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY not found in environment variables");
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log("Stripe initialized successfully");
  }
  return stripe;
};

/**
 * POST /api/payment/create-payment-intent
 *
 * Creates a Stripe PaymentIntent for processing payment
 *
 * Flow:
 * 1. Frontend sends order total amount
 * 2. Backend creates PaymentIntent on Stripe
 * 3. Returns clientSecret to frontend
 * 4. Frontend uses clientSecret to collect card payment
 *
 * @body {number} amount - Amount in HKD (will be converted to cents)
 * @body {string} orderId - Order ID to link payment to order
 * @returns {object} { clientSecret: string } - Secret for frontend to use
 */
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Get Stripe instance (initializes on first call)
    const stripe = getStripe();

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert HKD to cent
      currency: "hkd",

      // Metadata to link payment back to order
      // for webhook
      metadata: {
        orderId: orderId,
      },

      // Automatic payment methods (replaces payment_method_types)
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never", // stay on same page, no redirect
      },
    });

    // Return clientSecret to frontend
    // Frontend will use this to collect card details
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);

    // Send appropriate error to frontend
    res.status(500).json({
      error: error.message || "Failed to create payment intent",
    });
  }
});

/**
 * POST /api/payment/webhook
 *
 * Stripe webhook endpoint for async payment events
 * This ensures order confirmation even if user closes browser
 *
 * Events handled:
 * - payment_intent.succeeded: Confirm order and deduct quota
 *
 * @headers stripe-signature - Webhook signature for verification
 */
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).send("Webhook secret not configured");
  }

  let event;

  try {
    const stripe = getStripe();
    // Verify webhook signature (requires raw body)
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    console.log(`Payment succeeded for order: ${orderId}`);

    try {
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

      // Import confirmPayment logic dynamically to reuse existing function
      const { confirmPaymentInternal } = await import(
        "../mongodb/collections/orderColl.js"
      );

      // Call the shared confirmation logic
      const confirmedOrder = await confirmPaymentInternal(orderId);

      // Emit WebSocket event to notify user
      const io = req.app.get("io");
      if (io) {
        // Emit to specific user's room
        io.to(order.userId.toString()).emit("orderConfirmed", {
          orderId: confirmedOrder._id,
          status: "paid",
          paidAt: confirmedOrder.paidAt,
        });
        console.log(`WebSocket event sent to user ${order.userId}`);
      }

      console.log(`✓ Order ${orderId} confirmed successfully via webhook`);
      res.json({ received: true });
    } catch (err) {
      console.error("Webhook order confirmation error:", err);
      // Still return 200 to acknowledge receipt (Stripe requirement)
      res.json({ received: true, error: err.message });
    }
  } else {
    // Unknown event type
    console.log(`Unhandled event type: ${event.type}`);
    res.json({ received: true });
  }
});

export default router;
