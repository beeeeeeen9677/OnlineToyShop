import mongoose from "mongoose";
const Schema = mongoose.Schema;

const chatRoomSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  joinedUsers: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
  // key value pair of userId and last read timestamp
  lastReadTime: { type: Map, of: Date, default: {} },
});

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
export default ChatRoom;
