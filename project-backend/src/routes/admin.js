import express from "express";
import { uploadSingleFile } from "../middleware/multerSetup.js";
import {
  createNewGoods,
  updateGoods,
} from "../mongodb/collections/goodsColl.js";
const router = express.Router();

router.post("/goods", uploadSingleFile, createNewGoods);
router.put("/goods/:id", uploadSingleFile, updateGoods);
export default router;
