import dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import http from "http";
import { Server } from "socket.io";
import initSocket from "./src/socket.js";
import cors from "cors";

//import path from 'path';

// Mongo
import mongoose from "mongoose";
import connectDB from "./src/mongodb/dbConnection.js";

// Cron jobs for mongo Order collection
import { startOrderCleanup } from "./src/cron/cleanupExpiredOrders.js";

// Supabase client (export for use in router)
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Firebase Admin SDK
import admin from "firebase-admin";
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  const jsonString = Buffer.from(
    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
    "base64"
  ).toString("utf8");
  serviceAccount = JSON.parse(jsonString);
} else {
  console.error("FIREBASE_SERVICE_ACCOUNT_BASE64 env variable not set");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
export default admin;

// Routes
import adminRoutes from "./src/routes/admin.js";
import authRoutes from "./src/routes/auth.js";
import cartRoutes from "./src/routes/cart.js";
import chatRoutes from "./src/routes/chat.js";
import goodRoutes from "./src/routes/goods.js";
import orderRoutes from "./src/routes/order.js";
import paymentRoutes from "./src/routes/payment.js";
import userRoutes from "./src/routes/user.js";

// Import middleware
import { verifyFirebaseToken } from "./src/middleware/authMiddleware.js";

// Import webhook handler
import { handleStripeWebhook } from "./src/webhooks/stripeWebhook.js";

// conect to MongoDB
connectDB(process.env.MONGO_CONNECTION_STRING);

// Initialize Express app
const app = express();
const PORT = process.env.PORT;

// Trust proxy - Get real client IP from reverse proxy headers
app.set("trust proxy", 1);

// CORS Configuration - Allow production + all Vercel preview deployments
const allowedOriginChecker = (origin, callback) => {
  // Allow requests with no origin (mobile apps, Postman, etc.)
  if (!origin) return callback(null, true);

  // Allow main production URL
  if (origin === process.env.FRONTEND_URL) {
    return callback(null, true);
  }

  // Allow all Vercel preview/deployment URLs
  const vercelPattern = /^https:\/\/online-toy-shop-[a-z0-9-]*\.vercel\.app$/;
  if (vercelPattern.test(origin)) {
    return callback(null, true);
  }

  // Allow localhost for development
  if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
    return callback(null, true);
  }

  console.warn("CORS blocked origin:", origin);
  callback(new Error("Not allowed by CORS"));
};

const corsOptions = {
  origin: allowedOriginChecker,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Initialize Stripe
import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
console.log("Stripe initialized");
// Stripe webhook - MUST come BEFORE express.json() and BEFORE auth middleware
// This is a public endpoint (no Firebase auth) that needs raw body for signature verification
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }), // Preserve raw body
  (req, res) => handleStripeWebhook(req, res)
);

app.use(express.json());
app.use(
  session({
    secret: "sexionchinpodekai",
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: { httpOnly: true, maxAge: 15 * 60 * 1000 }, // 15 minutes
  })
);

// Health check endpoint (for keep-alive services)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Public Routes
app.use("/api/auth", authRoutes);
app.use("/api/goods", goodRoutes);
// User Authentication Middleware (Firebase)
app.use(verifyFirebaseToken); // check token

// Protected routes
app.use("/api/user", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/chat", chatRoutes);

// Admin Authorization Middleware
const adminOnly = (req, res, next) => {
  if (req.session.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
};
app.use("/api/admin", adminOnly, adminRoutes);

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOriginChecker,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io accessible in api
app.set("io", io);
// Socket.IO events
initSocket(io);

// Start server only after successful DB connection
mongoose.connection.once("open", () => {
  startOrderCleanup(); // for mongo

  server.listen(PORT, () => {
    console.log(`Server is running & listening to port: ${PORT}`);
  });
});
