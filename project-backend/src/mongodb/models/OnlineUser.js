import mongoose from "mongoose";
const Schema = mongoose.Schema;

const onlineUserSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  socketIds: { type: [String], default: [] }, // for multiple devices
});

const OnlineUser = mongoose.model("OnlineUser", onlineUserSchema);

export default OnlineUser;
