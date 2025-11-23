import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import { createNewUser } from "../mongodb/collections/userColl.js";
import express from "express";
const router = express.Router();

router.post("/register", createNewUser);
router.post("/logout", verifyFirebaseToken, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logout successful" });
  });
});

export default router;
