// backend/models/carDataModels.js
const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
});

const modelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  variants: [variantSchema],
});

const carDataSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    imgUrl: {
      type: String,
      default: "/images/Carbrand/default.png",
    },
    models: [modelSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CarData", carDataSchema);
