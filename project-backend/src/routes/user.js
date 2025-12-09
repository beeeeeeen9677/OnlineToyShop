import express from "express";
const router = express.Router();
import {
  getUserByFirebaseUID,
  getUserByID,
} from "../mongodb/collections/userColl.js";
import User from "../mongodb/models/User.js";

router.post("/", getUserByFirebaseUID); // call when login, also set session user
router.get("/last-verification-email", async (req, res) => {
  try {
    const userId = req.session.user._id;
    const user = await User.findById(userId).exec();
    const lastEmailSentAt = user?.lastVerificationEmailSentAt || null;
    res.status(200).json(lastEmailSentAt);
  } catch (error) {
    console.error("Error fetching last verification email time:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/last-verification-email", async (req, res) => {
  try {
    const userId = req.session.user._id;
    await User.findByIdAndUpdate(userId, {
      lastVerificationEmailSentAt: new Date(),
    }).exec();
    res.status(200).json({ message: "Last verification email time updated" });
  } catch (error) {
    console.error("Error updating last verification email time:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/limited-data/:id", getUserByID);

export default router;
