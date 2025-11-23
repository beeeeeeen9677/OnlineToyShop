import express from "express";
const router = express.Router();
import { getUserByFirebaseUID } from "../mongodb/collections/userColl.js";

router.post("/", getUserByFirebaseUID);
router.get("/last-verification-email", async (req, res) => {
  try {
    const lastEmailSentAt = req.session.lastEmailSentAt || null;
    res.status(200).json(lastEmailSentAt);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/last-verification-email", async (req, res) => {
  try {
    const { timeStamp } = req.body;
    req.session.lastEmailSentAt = timeStamp;
    res.status(200).json({ message: "Last verification email time updated" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
