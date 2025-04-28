// productModels.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    carName: { type: String, required: [true, "Nama mobil harus diisi"] },
    brand: { type: String, required: [true, "Merek mobil harus diisi"] },
    model: { type: String, required: [true, "Model mobil harus diisi"] },
    variant: { type: String, required: [true, "Varian mobil harus diisi"] },
    type: { type: String, required: [true, "Tipe mobil harus diisi"] },
    carColor: { type: String, required: [true, "Warna mobil harus diisi"] },
    cc: { type: Number, required: [true, "Kapasitas mesin (CC) harus diisi"] },
    travelDistance: {
      type: Number,
      required: [true, "Jarak tempuh (KM) harus diisi"],
    },
    driveSystem: {
      type: String,
      required: [true, "Sistem penggerak harus diisi"],
    },
    transmission: {
      type: String,
      required: [true, "Transmisi harus diisi"],
    },
    fuelType: {
      type: String,
      required: [true, "Jenis bahan bakar harus diisi"],
    },
    stnkExpiry: {
      type: String,
      required: [true, "Masa berlaku STNK harus diisi"],
    },
    plateNumber: {
      type: String,
      required: [true, "Nomor plat harus diisi"],
    },
    yearOfAssembly: {
      type: Number,
      required: [true, "Tahun perakitan harus diisi"],
    },
    price: { type: Number, required: [true, "Harga mobil harus diisi"] },
    images: {
      type: [String],
      required: [true, "Gambar mobil harus diunggah"],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "Minimal harus ada satu gambar",
      },
    },
    status: {
      type: String,
      enum: ["Tersedia", "Terjual"],
      default: "Tersedia",
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
