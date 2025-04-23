const express = require("express");
const {
  createTradeInRequest,
  getAllTradeInRequests,
  getTradeInRequestById,
  updateTradeInStatus, // <-- Impor fungsi baru
} = require("../controllers/tradeInController");

// Impor middleware autentikasi/autorisasi jika diperlukan
// const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Rute utama untuk membuat permintaan baru (Public)
router.post("/", createTradeInRequest);

// Rute untuk mendapatkan semua permintaan (Admin Only - Contoh dengan middleware)
// router.get("/", protect, admin, getAllTradeInRequests);
router.get("/", getAllTradeInRequests); // Versi tanpa auth (sesuaikan!)

// Rute untuk mendapatkan detail satu permintaan (Admin Only - Contoh dengan middleware)
// router.get("/:id", protect, admin, getTradeInRequestById);
router.get("/:id", getTradeInRequestById); // Versi tanpa auth (sesuaikan!)

// --- RUTE BARU UNTUK UPDATE STATUS ---
// Menggunakan PATCH karena hanya update sebagian data (status)
// Pastikan rute ini diproteksi jika hanya admin yang boleh mengubah status
// router.patch("/:id/status", protect, admin, updateTradeInStatus); // Opsi 1: Rute lebih spesifik
router.patch("/:id", updateTradeInStatus); // Opsi 2: Rute generik (controller handle field 'status') - Versi tanpa auth

// Anda juga bisa menggunakan PUT jika lebih disukai
// router.put("/:id", protect, admin, updateTradeInStatus); // Versi tanpa auth

module.exports = router;
