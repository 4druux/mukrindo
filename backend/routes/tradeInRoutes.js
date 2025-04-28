const express = require("express");
const {
  createTradeInRequest,
  getAllTradeInRequests,
  getTradeInRequestById,
  updateTradeInStatus,
} = require("../controllers/tradeInController");

const router = express.Router();

router.post("/", createTradeInRequest);

router.get("/", getAllTradeInRequests);

router.get("/:id", getTradeInRequestById);

router.patch("/:id", updateTradeInStatus);
module.exports = router;
