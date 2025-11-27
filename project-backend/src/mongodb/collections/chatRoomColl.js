import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import ChatRoom from "../models/ChatRoom.js";
import User from "../models/User.js";

// Setup dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
const HK_TIMEZONE = "Asia/Hong_Kong";

export const createChatRoom = async (req, res) => {
  try {
    const { userId } = req.body; // user excluding admin
    const adminIds = await User.find({ role: "admin" })
      .select("_id")
      .lean()
      .exec();
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
    const chatRooms = await ChatRoom.find({ joinedUsers: userId })
      .lean()
      .exec();

    // Convert createdAt from UTC to HK timezone
    const roomsWithHKTime = chatRooms.map((room) => ({
      ...room,
      createdAt: dayjs(room.createdAt)
        .tz(HK_TIMEZONE)
        .format("YYYY-MM-DDTHH:mm:ss"),
    }));

    res.json(roomsWithHKTime);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
