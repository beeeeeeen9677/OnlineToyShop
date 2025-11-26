import Message from "../models/Message.js";

export const getMessagesByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).exec();
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: err.message });
  }
};
