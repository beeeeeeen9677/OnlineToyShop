import { Router } from "express";
import Stripe from "stripe";

const router = Router();

// Stripe will be initialized lazily when first request comes in
// This ensures .env is loaded first by server.js
let stripe;

const getStripe = () => {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY not found in environment variables");
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log("✅ Stripe initialized successfully");
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
    // Amount must be in cents (smallest currency unit)
    // HKD doesn't have cents, but Stripe requires integer (e.g., 100 HKD = 10000)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert HKD to smallest unit
      currency: "hkd",

      // Metadata to link payment back to our order
      metadata: {
        orderId: orderId,
      },

      // Payment method types to accept
      payment_method_types: ["card"],

      // Automatic payment confirmation
      // After card is entered, payment processes immediately
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never", // Stay on same page (no redirect)
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
