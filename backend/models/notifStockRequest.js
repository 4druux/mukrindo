const mongoose = require("mongoose");

const NotifStockRequestSchema = new mongoose.Schema(
  {
    notifStockBrand: {
      type: String,
      required: [true, "Merek mobil wajib diisi"],
      trim: true,
    },
    notifStockModel: {
      type: String,
      required: [true, "Model mobil wajib diisi"],
      trim: true,
    },
    notifStockYear: {
      type: String,
      required: [true, "Tahun mobil wajib diisi"],
    },
    customerPhoneNumber: {
      type: String,
      required: [true, "Nomor telepon wajib diisi"],
      match: [/^\d{9,15}$/, "Format nomor telepon tidak valid."],
    },
    status: {
      type: String,
      enum: ["Pending", "Dihubungi"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotifStockRequest", NotifStockRequestSchema);
