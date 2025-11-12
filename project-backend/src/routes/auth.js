import { createNewUser } from "../mongodb/collections/userColl.js";
import express from "express";
const router = express.Router();

router.post("/register", createNewUser);

export default router;
