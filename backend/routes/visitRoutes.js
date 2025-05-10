// routes/visitRoutes.js
const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');

// Endpoint untuk melacak kunjungan ke beranda
// Frontend Anda (misalnya, komponen Beranda di React/Next.js) akan memanggil endpoint ini
// Biasanya menggunakan metode POST, meskipun tidak ada body yang signifikan,
// ini adalah praktik umum untuk tindakan yang menyebabkan perubahan/pencatatan data.
router.post('/homepage/track', visitController.trackHomepageVisit);

// Endpoint untuk mendapatkan statistik kunjungan (untuk dashboard admin)
router.get('/homepage/stats', visitController.getHomepageVisitStats);

module.exports = router;