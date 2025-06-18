const mongoose = require("mongoose");

const SellRequestSchema = new mongoose.Schema(
  {
    // Step 1: Info Mobil yang Dijual
    buySellBrand: {
      type: String,
      required: [true, "Merek mobil wajib diisi"],
    },
    buySellModel: {
      type: String,
      required: [true, "Model mobil wajib diisi"],
    },
    buySellVariant: {
      type: String,
      required: [true, "Varian mobil wajib diisi"],
    },
    buySellYear: {
      type: String,
      required: [true, "Tahun mobil wajib diisi"],
    },
    buySellTransmission: {
      type: String,
      required: [true, "Transmisi mobil wajib diisi"],
    },
    buySellStnkExpiry: {
      type: String,
      required: [true, "Tanggal STNK wajib diisi"],
    },
    buySellColor: {
      type: String,
      required: [true, "Warna mobil wajib diisi"],
    },
    buySellTravelDistance: {
      type: Number,
      required: [true, "Jarak tempuh wajib diisi"],
      min: [0, "Jarak tempuh tidak boleh negatif"],
    },
    buySellPrice: {
      type: Number,
      required: [true, "Harga penawaran wajib diisi"],
      min: [1, "Harga penawaran harus positif"],
    },

    // Step 2: Info Kontak
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

    // Step 3: Lokasi & Jadwal Inspeksi
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

    status: {
      type: String,
      enum: ["Pending", "Dihubungi", "Selesai", "Dibatalkan"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SellRequest", SellRequestSchema);
