import express from "express";
const router = express.Router();
import {
  createChatRoom,
  getChatRoomsForUser,
} from "../mongodb/collections/chatRoomColl.js";
import { getMessagesByRoomId } from "../mongodb/collections/messageColl.js";

router.post("/chatRooms", createChatRoom);
router.get("/chatRooms/:userId", getChatRoomsForUser);
router.get("/messages/:roomId", getMessagesByRoomId);
export default router;
