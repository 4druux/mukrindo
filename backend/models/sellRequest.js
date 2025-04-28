const mongoose = require("mongoose");

const SellRequestSchema = new mongoose.Schema(
  {
    // Step 1: Info Mobil yang Dijual
    carBrand: {
      // Ganti nama dari tradeInBrand
      type: String,
      required: [true, "Merek mobil wajib diisi"],
    },
    carModel: {
      // Ganti nama dari tradeInModel
      type: String,
      required: [true, "Model mobil wajib diisi"],
    },
    carVariant: {
      // Ganti nama dari tradeInVariant
      type: String,
      required: [true, "Varian mobil wajib diisi"],
    },
    carYear: {
      // Ganti nama dari tradeInYear
      type: String,
      required: [true, "Tahun mobil wajib diisi"],
    },
    carTransmission: {
      // Ganti nama dari tradeInTransmission
      type: String,
      required: [true, "Transmisi mobil wajib diisi"],
    },
    carStnkExpiry: {
      // Ganti nama dari tradeInStnkExpiry
      type: String,
      required: [true, "Tanggal STNK wajib diisi"],
    },
    carColor: {
      // Ganti nama dari tradeInColor
      type: String,
      required: [true, "Warna mobil wajib diisi"],
    },
    carTravelDistance: {
      // Ganti nama dari tradeInTravelDistance
      type: Number,
      required: [true, "Jarak tempuh wajib diisi"],
      min: [0, "Jarak tempuh tidak boleh negatif"],
    },
    carPrice: {
      // Field baru untuk harga penawaran
      type: Number,
      required: [true, "Harga penawaran wajib diisi"],
      min: [1, "Harga penawaran harus positif"], // Harga tidak boleh 0 atau negatif
    },

    // Step 2: Info Kontak (Sama seperti TradeIn)
    customerName: {
      type: String,
      required: [true, "Nama pelanggan wajib diisi"],
      trim: true,
    },
    customerPhoneNumber: {
      type: String,
      required: [true, "Nomor telepon wajib diisi"],
    },
    customerEmail: {
      type: String,
      required: [true, "Email wajib diisi"],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Format email tidak valid"],
    },

    // Step 3: Lokasi & Jadwal Inspeksi (Sama seperti TradeIn)
    inspectionLocationType: {
      type: String,
      required: true,
      enum: ["showroom", "rumah"],
    },
    inspectionShowroomAddress: {
      type: String,
      required: function () {
        return this.inspectionLocationType === "showroom";
      },
    },
    inspectionProvince: {
      type: String,
      required: function () {
        return this.inspectionLocationType === "rumah";
      },
    },
    inspectionCity: {
      type: String,
      required: function () {
        return this.inspectionLocationType === "rumah";
      },
    },
    inspectionFullAddress: {
      type: String,
      required: function () {
        return this.inspectionLocationType === "rumah";
      },
      trim: true,
    },
    inspectionDate: {
      type: String,
      required: [true, "Tanggal inspeksi wajib diisi"],
    },
    inspectionTime: {
      type: String,
      required: [true, "Jam inspeksi wajib diisi"],
    },

    // Status (Sama seperti TradeIn)
    status: {
      type: String,
      enum: ["Pending", "Dihubungi", "Selesai", "Dibatalkan"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Pastikan nama model unik ('SellRequest')
module.exports = mongoose.model("SellRequest", SellRequestSchema);
