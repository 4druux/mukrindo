// routes/notificationRoutes.js
const express = require("express");
const {
  createNotificationRequest,
  getAllNotificationRequests,
  getNotificationRequestById,
  updateNotificationStatus,
  deleteNotificationRequest,
} = require("../controllers/notificationController");

// Di sini Anda mungkin perlu menambahkan middleware untuk proteksi route admin
// const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Rute Publik
router.post("/", createNotificationRequest); // Endpoint untuk submit form

// Rute Admin (Contoh - perlu middleware protect/admin)
router.get("/", /* protect, admin, */ getAllNotificationRequests);
router.get("/:id", /* protect, admin, */ getNotificationRequestById);
router.patch("/:id", /* protect, admin, */ updateNotificationStatus);
router.delete("/:id", /* protect, admin, */ deleteNotificationRequest);

module.exports = router;
