import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import {
  createNewUser,
  completeProfile,
} from "../mongodb/collections/userColl.js";
import express from "express";
const router = express.Router();

// Temporary in-memory store for reset email timestamps (for unauthenticated users)
// Map<email, timestamp>
const resetEmailTimestamps = new Map();

// Cleanup old entries every hour (prevent memory leak)
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [email, timestamp] of resetEmailTimestamps.entries()) {
    if (new Date(timestamp).getTime() < oneHourAgo) {
      resetEmailTimestamps.delete(email);
    }
  }
}, 60 * 60 * 1000);

router.post("/register", createNewUser);
router.post("/complete-profile", verifyFirebaseToken, completeProfile);
router.post("/logout", verifyFirebaseToken, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logout successful" });
  });
});

router.get("/last-reset-email", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const lastResetEmailSentAt = resetEmailTimestamps.get(email) || null;
    res.status(200).json(lastResetEmailSentAt);
  } catch (error) {
    console.error("Error fetching last reset email time:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/last-reset-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const timestamp = new Date();
    resetEmailTimestamps.set(email, timestamp);
    res.status(200).json({
      message: "Last reset email time updated",
      timestamp: timestamp.toISOString(),
    });
  } catch (error) {
    console.error("Error updating last reset email time:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
