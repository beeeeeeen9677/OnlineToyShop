import mongoose from "mongoose";
const Schema = mongoose.Schema;

const goodSchema = new Schema({
  name: { type: String, required: true },
  preorderCloseDate: { type: Date, required: true },
  shippingDate: { type: Date, required: true },
  price: { type: Number, required: true },
  //description: { type: String, required: true },
  description: { type: Map, of: String, required: true },
  quota: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  viewedCount: { type: Number, default: 0 },
  broughtCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  category: [
    {
      type: String,
      enum: [
        "gunpla",
        "model",
        "figure",
        "puzzle",
        "board game",
        "electronic",
        "other",
      ],
      required: false,
    },
  ],
  available: { type: Boolean, default: true },
});

const Good = mongoose.model("Good", goodSchema);

export default Good;
