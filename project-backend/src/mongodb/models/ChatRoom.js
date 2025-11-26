import mongoose from "mongoose";
const Schema = mongoose.Schema;

const chatRoomSchema = new Schema({
  roomId: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
  joinedUsers: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
});

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
export default ChatRoom;
