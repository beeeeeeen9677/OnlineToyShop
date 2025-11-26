const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected, socket-id:", socket.id);

    // Join a room
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Send message to a room
    socket.on("send_message", ({ roomId, message }) => {
      io.to(roomId).emit("receive_message", {
        senderId: socket.id,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  });
};

export default initSocket;
