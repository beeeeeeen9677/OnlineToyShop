import mongoose from "mongoose";
const Schema = mongoose.Schema;

const onlineUserSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  socketId: { type: String, required: true, unique: true },
  connectedAt: { type: Date, default: Date.now },
});

const OnlineUser = mongoose.model("OnlineUser", onlineUserSchema);

export default OnlineUser;
