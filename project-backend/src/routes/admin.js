import express from "express";
import { uploadSingleFile } from "../middleware/multerSetup.js";
import { createNewGood } from "../mongodb/collections/goodsColl.js";
const router = express.Router();

router.post("/goods", uploadSingleFile, createNewGood);

export default router;
