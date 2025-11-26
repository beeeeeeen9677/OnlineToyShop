import ChatRoom from "../models/ChatRoom.js";
import User from "../models/User.js";
//import crypto from "crypto";

export const createChatRoom = async (req, res) => {
  try {
    const { userId } = req.body; // user excluding admin
    const adminIds = await User.find({ role: "admin" }).select("_id").exec();
    const userIds = [userId, ...adminIds.map((admin) => admin._id)];
    const newRoom = new ChatRoom({
      //roomId: crypto.randomUUID(), // use mongoDB id directly
      joinedUsers: userIds,
    });
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getChatRoomsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const chatRooms = await ChatRoom.find({ joinedUsers: userId }).exec();
    res.json(chatRooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
