import express from "express";
const router = express.Router();
import {
  createChatRoom,
  getChatRoomsForUser,
} from "../mongodb/collections/chatRoomColl.js";

router.post("/chatRooms", createChatRoom);
router.get("/chatRooms/:userId", getChatRoomsForUser);

export default router;
