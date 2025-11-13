import express from "express";
import { uploadSingleFile } from "../middleware/multerSetup.js";
import { createNewGood } from "../mongodb/collections/goodsColl.js";
const router = express.Router();

router.post("/goods", uploadSingleFile, createNewGood);
router.get("/test-admin", (req, res) => {
  console.log("Admin test route accessed");
  res.json({
    message: "Admin route is working!",
    timestamp: new Date().toISOString(),
  });
});
export default router;
