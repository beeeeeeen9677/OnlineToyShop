import Message from "./mongodb/models/Message.js";
import OnlineUser from "./mongodb/models/OnlineUser.js";
import ChatRoom from "./mongodb/models/ChatRoom.js";

const initSocket = async (io) => {
  await OnlineUser.deleteMany().exec(); // Clear online users on server restart
  io.on("connection", async (socket) => {
    const { userId } = socket.handshake.auth;
    try {
      await OnlineUser.updateOne(
        { userId },
        { $set: { userId }, $addToSet: { socketIds: socket.id } }, // add new socketId
        { upsert: true }
      ).exec();

      //console.log(`User ${userId} connected, socket-id: ${socket.id}`);

      // Auto-join all rooms
      const userRooms = await ChatRoom.find({ joinedUsers: { $in: [userId] } })
        .select("_id") // only need room IDs
        .lean()
        .exec();
      userRooms.forEach((room) => {
        socket.join(room._id.toString());
        //console.log(`User ${userId} auto-joined room ${room._id}`);
      });
    } catch (err) {
      console.error("Error creating online user:", err);
    }

    // Send message to a room
    socket.on("sendMessage", async ({ roomId, message }) => {
      // console.log("Send message :", userId, message);

      try {
        const msg = await Message.create({
          senderId: userId,
          roomId,
          message,
          // timestamp auto-generated as UTC by schema default
        });
        io.to(roomId).emit("receiveMessage", {
          roomId,
          senderId: userId,
          message,
          timestamp: msg.timestamp, // UTC Date from MongoDB
        });
        // console.log(`Message sent to room ${roomId}`);
      } catch (error) {
        console.error("Error saving or sending message:", error);
      }
    });

    socket.on("disconnect", async () => {
      //console.log(`User ${userId} disconnected`, socket.id);
      try {
        await OnlineUser.updateOne(
          { userId },
          { $pull: { socketIds: socket.id } }
        ).exec();
        await OnlineUser.deleteOne({ userId, socketIds: { $size: 0 } }).exec();
      } catch (error) {
        console.error("Error deleting online user on disconnect:", error);
      }
    });
  });
};

export default initSocket;
