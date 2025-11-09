import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
//import path from 'path';

import mongoose from "mongoose";
import connectDB from "./mongodb/dbConnection.js";

// Routes
import authRoutes from "./routes/auth.js";

// Load environment variables

// conect to MongoDB
connectDB(process.env.MONGO_CONNECTION_STRING);

// Initialize Express app
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Online Toy Shop API!",
    status: "Server is running successfully",
  });
});

// API routes
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
  });
});

// Start server only after successful DB connection
mongoose.connection.once("open", () => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running & listening to port: ${PORT}`);
  });
});

// Start server
