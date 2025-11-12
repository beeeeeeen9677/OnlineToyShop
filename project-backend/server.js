import dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import cors from "cors";
//import path from 'path';

// Mongo
import mongoose from "mongoose";
import connectDB from "./mongodb/dbConnection.js";

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";

// Import middleware
import { verifyFirebaseToken } from "./middleware/authMiddleware.js";

// Load environment variables

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
app.get("/api/protected-test", (req, res) => {
  res.json({
    message: "Protected route is working!",
    user: {
      uid: req.user.uid,
      email: req.user.email,
    },
  });
});
// Protected routes
app.use("/api/user", userRoutes);

// Start server only after successful DB connection
mongoose.connection.once("open", () => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running & listening to port: ${PORT}`);
  });
});

// Start server
