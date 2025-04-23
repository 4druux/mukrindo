const mongoose = require("mongoose");

const TradeInRequestSchema = new mongoose.Schema(
  {
    // Step 1: Info Mobil Lama
    tradeInBrand: {
      type: String,
      required: [true, "Merek mobil lama wajib diisi"],
    },
    tradeInModel: {
      type: String,
      required: [true, "Model mobil lama wajib diisi"],
    },
    tradeInVariant: {
      type: String,
      required: [true, "Varian mobil lama wajib diisi"],
    },
    tradeInYear: {
      type: String,
      required: [true, "Tahun mobil lama wajib diisi"],
    }, // Bisa juga Number jika validasi ketat
    tradeInTransmission: {
      type: String,
      required: [true, "Transmisi mobil lama wajib diisi"],
    },
    tradeInStnkExpiry: {
      type: String,
      required: [true, "Tanggal STNK wajib diisi"],
    }, // Pertimbangkan tipe Date jika perlu query rentang
    tradeInColor: {
      type: String,
      required: [true, "Warna mobil lama wajib diisi"],
    },
    tradeInTravelDistance: {
      type: Number,
      required: [true, "Jarak tempuh wajib diisi"],
      min: 0,
    },
    // tradeInPrice: { type: Number }, // Anda tidak menyertakan ini di form, tapi ada di submissionData? Jika perlu, tambahkan.

    // Step 2: Info Kontak
    customerName: {
      type: String,
      required: [true, "Nama pelanggan wajib diisi"],
      trim: true,
    },
    customerPhoneNumber: {
      type: String,
      required: [true, "Nomor telepon wajib diisi"],
    }, // Simpan tanpa format (+62)
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
    }, // Pertimbangkan tipe Date
    inspectionTime: {
      type: String,
      required: [true, "Jam inspeksi wajib diisi"],
    },

    // Step 4: Preferensi Mobil Baru
    newCarBrandPreference: {
      type: String,
      required: [true, "Preferensi merek mobil baru wajib diisi"],
    },
    newCarModelPreference: {
      type: String,
      required: [true, "Preferensi model mobil baru wajib diisi"],
    },
    newCarVariantPreference: {
      type: String,
      required: [true, "Preferensi varian mobil baru wajib diisi"],
    },
    newCarTransmissionPreference: {
      type: String,
      required: [true, "Preferensi transmisi mobil baru wajib diisi"],
    },
    newCarColorPreference: {
      type: String,
      required: [true, "Preferensi warna mobil baru wajib diisi"],
    },
    newCarPriceRangePreference: {
      type: String,
      required: [true, "Preferensi rentang harga wajib diisi"],
    }, // Bisa dipecah jadi min/max jika perlu query

    // Status Permintaan (Opsional, tapi bagus untuk tracking)
    status: {
      type: String,
      enum: ["Pending", "Contacted", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
); // Otomatis tambah createdAt dan updatedAt

module.exports = mongoose.model("TradeInRequest", TradeInRequestSchema);
