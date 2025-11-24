import dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import http from "http";
import { Server } from "socket.io";
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
import goodRoutes from "./src/routes/goods.js";

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
    rolling: true,
    cookie: { httpOnly: true, maxAge: 15 * 60 * 1000 }, // 15 minutes
  })
);

// Public Routes
app.use("/api/auth", authRoutes);
app.use("/api/goods", goodRoutes);
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

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

// ✅ Socket.IO events
io.on("connection", (socket) => {
  //console.log("User connected, socket-id:", socket.id);

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server only after successful DB connection
mongoose.connection.once("open", () => {
  server.listen(PORT, () => {
    console.log(`🚀 Server is running & listening to port: ${PORT}`);
  });
});

// Start server
