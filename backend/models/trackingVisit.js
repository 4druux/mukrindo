// models/TrackingVisit.js
const mongoose = require("mongoose");

const trackingVisitSchema = new mongoose.Schema(
  {
    visitorCookieId: {
      type: String,
      required: true,
      index: true,
    },
    visitTimestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const TrackingVisit = mongoose.model("TrackingVisit", trackingVisitSchema);
module.exports = TrackingVisit;
