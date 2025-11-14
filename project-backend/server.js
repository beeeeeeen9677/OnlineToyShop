import dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import cors from "cors";

//import path from 'path';

// Mongo
import mongoose from "mongoose";
import connectDB from "./src/mongodb/dbConnection.js";

// Supabase client (export for use in router)
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Routes
import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/user.js";
import adminRoutes from "./src/routes/admin.js";

// Import middleware
import { verifyFirebaseToken } from "./src/middleware/authMiddleware.js";

// conect to MongoDB
connectDB(process.env.MONGO_CONNECTION_STRING);

// Initialize Express app
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: "sexionchinpodekai",
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

// Public Routes
app.use("/api/auth", authRoutes);
// Test route - Public (should work without token)
app.get("/api/test", (req, res) => {
  res.json({
    message: "Public API is working!",
    timestamp: new Date().toISOString(),
  });
});
// User Authentication Middleware (Firebase)
app.use(verifyFirebaseToken);
// Test route - Protected (requires token)

// Protected routes
app.use("/api/user", userRoutes);

// Admin Authorization Middleware
const adminOnly = (req, res, next) => {
  if (req.session.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
};
app.use("/api/admin", adminOnly, adminRoutes);

// Start server only after successful DB connection
mongoose.connection.once("open", () => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running & listening to port: ${PORT}`);
  });
});

// Start server
