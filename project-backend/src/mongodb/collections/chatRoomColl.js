import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import OnlineUser from "../models/OnlineUser.js";

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

    // Get io instance from app
    const io = req.app.get("io");

    // Make all online users in this room join the socket room
    const onlineUsers = await OnlineUser.find({
      userId: { $in: userIds },
    })
      .lean()
      .exec();

    onlineUsers.forEach((onlineUser) => {
      onlineUser.socketIds.forEach((socketId) => {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
          socket.join(newRoom._id.toString());
          // console.log(
          //   `Auto-joined user ${onlineUser.userId} (socket ${socketId}) to new room ${newRoom._id}`
          // );
          io.to(socketId).emit("newChatRoom", newRoom);
        }
      });
    });

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

    const now = new Date();
    await ChatRoom.updateOne(
      { _id: roomId },
      { $set: { [`lastReadTime.${userId}`]: now } }
    ).exec();

    // Return the timestamp in ISO format for frontend to use
    res.json({ success: true, lastReadTime: now.toISOString() });
  } catch (err) {
    console.error("Error marking room as read:", err);
    res.status(500).json({ error: err.message });
  }
};
