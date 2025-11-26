import mongoose from "mongoose";
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  roomId: { type: Schema.Types.ObjectId, ref: "ChatRoom", required: true }, // Link to ChatRoom.roomId
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Who sent it
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
