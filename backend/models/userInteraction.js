// backend/models/UserInteraction.js

const mongoose = require("mongoose");

const UserInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  interactionType: {
    type: String,
    enum: ["view", "bookmark", "contact_seller"],
    default: "view",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

UserInteractionSchema.index({ userId: 1, timestamp: -1 });
UserInteractionSchema.index({ productId: 1 });

module.exports = mongoose.model("UserInteraction", UserInteractionSchema);
