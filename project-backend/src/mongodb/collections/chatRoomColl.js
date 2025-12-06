import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

// create a room with userId for specific user and all adminIds
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

// get all chat rooms with provided userId
export const getChatRoomsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const chatRooms = await ChatRoom.find({ joinedUsers: userId })
      .lean()
      .exec();

    // Get latest message timestamp for each room
    // without promise.all will get array of promise
    const roomsWithExtraData = await Promise.all(
      chatRooms.map(async (room) => {
        const latestMessage = await Message.findOne({ roomId: room._id })
          .sort({ timestamp: -1 }) // latest msg
          .select("timestamp senderId") // need timestamp and senderId
          .lean()
          .exec();

        // Get user's lastReadAt from the Map
        const userLastReadAt = room.lastReadTime?.[userId] || null;

        // Return UTC timestamps
        return {
          ...room,
          lastMessageTime: latestMessage?.timestamp || null,
          lastMessageSenderId: latestMessage?.senderId?.toString() || null,
          lastReadTime: userLastReadAt,
        };
      })
    );

    res.json(roomsWithExtraData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Mark room as read for current user
export const setLastReadAt = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.session.user._id;

    await ChatRoom.updateOne(
      { _id: roomId },
      { $set: { [`lastReadTime.${userId}`]: new Date() } }
    ).exec();

    res.json({ success: true });
  } catch (err) {
    console.error("Error marking room as read:", err);
    res.status(500).json({ error: err.message });
  }
};
