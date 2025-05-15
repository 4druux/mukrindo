const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["tradeIn", "buySell", "notifStock"],
      required: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "type", // Dynamic reference berdasarkan type
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Data untuk preview notifikasi
    preview: {
      model: {
        type: String,
        required: true,
        default: "",
      },
      customer: {
        // Info customer singkat
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

notificationSchema.virtual("requestData", {
  ref: function (doc) {
    return {
      tradeIn: "TradeInRequest",
      buySell: "SellRequest",
      notifStock: "NotifStockRequest",
    }[doc.type];
  },
  localField: "requestId",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Notification", notificationSchema);
