import mongoose from "mongoose";
const Schema = mongoose.Schema;

const chatRoomSchema = new Schema({
  roomId: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
  lastMessageId: { type: String, default: "" }, // quick preview
});

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
export default ChatRoom;
