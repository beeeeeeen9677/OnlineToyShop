import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  firebaseUID: { type: String, unique: true, required: true },
  email: { type: String, unique: true },
  gender: {
    type: String,
    enum: ["male", "female", "not answered"],
    default: "not answered",
  },
  dateOfBirth: { type: Date, required: true },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
});

const User = mongoose.model("User", userSchema);

export default User;
