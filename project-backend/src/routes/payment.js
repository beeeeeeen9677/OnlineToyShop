import { Router } from "express";
import { stripe } from "../../server.js";
import rateLimit from "express-rate-limit";

const router = Router();

// Better rate limiting for authenticated route
const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.session.user._id, // Track by userId instead of IP
  message: "Too many payment attempts, please try again later",
});

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
router.post("/create-payment-intent", paymentLimiter, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

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

export default router;
