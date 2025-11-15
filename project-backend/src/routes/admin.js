import express from "express";
import { uploadSingleFile } from "../middleware/multerSetup.js";
import { createNewGood, updateGood } from "../mongodb/collections/goodsColl.js";
const router = express.Router();

router.post("/goods", uploadSingleFile, createNewGood);
router.put("/goods/:id", uploadSingleFile, updateGood);
export default router;
