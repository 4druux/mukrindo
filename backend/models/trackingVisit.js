// models/homepageVisitModel.js
const mongoose = require("mongoose");

const trackingVisit = new mongoose.Schema({
  visitorCookieId: {
    // ID unik untuk setiap browser pengunjung
    type: String,
    required: true,
    index: true, // Indeks untuk pencarian yang lebih cepat
  },
  visitTimestamp: {
    // Waktu kunjungan
    type: Date,
    default: Date.now,
    required: true,
    index: true, // Indeks untuk query berdasarkan rentang tanggal
  },
  ipAddress: {
    // Opsional: Alamat IP pengunjung
    type: String,
  },
  userAgent: {
    // Opsional: User agent browser pengunjung
    type: String,
  },
  // Anda bisa menambahkan field lain jika diperlukan, misalnya 'pagePath' jika ingin melacak halaman lain
});

// Indeks gabungan bisa berguna jika Anda sering query berdasarkan visitorCookieId dan timestamp
// trackingVisit.index({ visitorCookieId: 1, visitTimestamp: -1 });

const HomepageVisit = mongoose.model("HomepageVisit", trackingVisit);

module.exports = HomepageVisit;
