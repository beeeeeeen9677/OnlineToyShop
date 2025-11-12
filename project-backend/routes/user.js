import express from "express";
const router = express.Router();
import { getUserByFirebaseUID } from "../mongodb/collections/userColl.js";

router.post("/", getUserByFirebaseUID);

export default router;
