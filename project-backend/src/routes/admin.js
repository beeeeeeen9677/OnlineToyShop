import express from "express";
import { uploadSingleFile } from "../middleware/multerSetup.js";
import {
  createNewGoods,
  updateGoods,
} from "../mongodb/collections/goodsColl.js";
import { getUserByID } from "../mongodb/collections/userColl.js";
import { getOrderByUserId } from "../mongodb/collections/orderColl.js";

const router = express.Router();

router.post("/goods", uploadSingleFile, createNewGoods);
router.put("/goods/:id", uploadSingleFile, updateGoods);
router.get("/user/:id", getUserByID);
router.get("/orders/:userId", getOrderByUserId);
export default router;
