import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Cart item sub-schema
const cartItemSchema = new Schema(
  {
    goodId: { type: Schema.Types.ObjectId, ref: "Good", required: true },
    quantity: { type: Number, required: true, min: 1, max: 3 },
  },
  { _id: false } // No separate _id for cart items
);

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
  dateOfBirth: { type: Date, required: false },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  cart: { type: [cartItemSchema], default: [] },
  profileComplete: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

export default User;
