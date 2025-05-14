// models/notificationRequest.js
const mongoose = require("mongoose");

const NotifStockRequestSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: [true, "Merek mobil wajib diisi"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Model mobil wajib diisi"],
      trim: true,
    },
    year: {
      type: String, // Tahun bisa berupa string jika hanya untuk display/filter
      required: [true, "Tahun mobil wajib diisi"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Nomor telepon wajib diisi"],
      // Anda bisa menambahkan validasi regex sederhana di sini jika perlu,
      // tapi validasi utama sudah ada di frontend dan controller bisa cek lagi
    },
    status: {
      type: String,
      enum: ["Pending", "Dihubungi"], // Status permintaan
      default: "Pending",
    },
    // Anda bisa tambahkan field lain jika perlu, misal:
    // notifiedAt: Date,
    // notifiedCarId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
  },
  { timestamps: true } // Menambahkan createdAt dan updatedAt otomatis
);

module.exports = mongoose.model(
  "NotifStockRequest", // Nama model singular
  NotifStockRequestSchema
);
