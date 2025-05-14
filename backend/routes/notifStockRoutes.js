// routes/notificationRoutes.js
const express = require("express");
const {
  createNotifStockRequest,
  getAllNotifStockRequests,
  getNotifStockRequestById,
  updateNotifStockRequestStatus,
  deleteNotifStockRequest,
} = require("../controllers/notifStockController");

// Di sini Anda mungkin perlu menambahkan middleware untuk proteksi route admin
// const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Rute Publik
router.post("/", createNotifStockRequest); // Endpoint untuk submit form

// Rute Admin (Contoh - perlu middleware protect/admin)
router.get("/", /* protect, admin, */ getAllNotifStockRequests);
router.get("/:id", /* protect, admin, */ getNotifStockRequestById);
router.patch("/:id", /* protect, admin, */ updateNotifStockRequestStatus);
router.delete("/:id", /* protect, admin, */ deleteNotifStockRequest);

module.exports = router;
