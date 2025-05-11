// models/homepageVisitModel.js
const mongoose = require("mongoose");

const trackingVisit = new mongoose.Schema({
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
});

const HomepageVisit = mongoose.model("HomepageVisit", trackingVisit);

module.exports = HomepageVisit;
