// backend/models/productRecommendation.js
const mongoose = require("mongoose");

const ProductRecommendationSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },
    recommendations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    type: String,
    lastUpdated: Date,
  },
  { collection: "productrecommendations" }
);

module.exports = mongoose.model(
  "ProductRecommendation",
  ProductRecommendationSchema
);
