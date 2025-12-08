import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import {
  createNewUser,
  completeProfile,
} from "../mongodb/collections/userColl.js";
import express from "express";
const router = express.Router();

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
    const lastResetEmailSentAt = req.session.lastResetEmailSentAt || null;
    res.status(200).json(lastResetEmailSentAt);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/last-reset-email", async (req, res) => {
  try {
    const { timeStamp } = req.body;
    req.session.lastResetEmailSentAt = timeStamp;
    res.status(200).json({ message: "Last reset email time updated" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
