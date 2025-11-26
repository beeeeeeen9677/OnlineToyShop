import Message from "./mongodb/models/Message.js";
import OnlineUser from "./mongodb/models/OnlineUser.js";

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
    } catch (err) {
      console.error("Error creating online user:", err);
    }

    // Join a room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Send message to a room
    socket.on("sendMessage", async ({ roomId, message }) => {
      const timestamp = new Date().toISOString();
      try {
        const msg = await Message.create({
          roomId,
          senderId: userId,
          message,
          timestamp,
        });
        io.to(roomId).emit("receiveMessage", {
          roomId,
          senderId: userId,
          message,
          timestamp,
        });
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
