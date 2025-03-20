// utils/validateProductData.js
export const validateProductData = (productData, mediaFiles) => {
  const {
    carName,
    brand,
    model,
    variant,
    type,
    carColor,
    cc,
    travelDistance,
    driveSystem,
    transmission,
    fuelType,
    stnkExpiry,
    plateNumber,
    yearOfAssembly,
    price,
    status,
  } = productData;

  if (!carName) return "Nama mobil harus diisi.";
  if (!brand) return "Merek mobil harus diisi.";
  if (!model) return "Model mobil harus diisi.";
  if (!variant) return "Varian mobil harus diisi.";
  if (!type) return "Tipe mobil harus diisi.";
  if (!carColor) return "Warna mobil harus diisi.";
  if (!cc) return "Kapasitas mesin (CC) harus diisi.";
  if (!travelDistance) return "Jarak tempuh (KM) harus diisi.";
  if (!driveSystem) return "Sistem penggerak harus diisi.";
  if (!transmission) return "Transmisi harus diisi.";
  if (!fuelType) return "Jenis bahan bakar harus diisi.";
  if (!stnkExpiry) return "Masa berlaku STNK harus diisi.";
  if (!plateNumber) return "Nomor plat harus diisi.";
  if (!yearOfAssembly) return "Tahun perakitan harus diisi.";
  if (!price) return "Harga mobil harus diisi.";
  if (!status) return "Status mobil harus diisi";
  if (!["available", "sold out"].includes(status)) return "Status tidak valid";
  if (mediaFiles.length === 0) return "Minimal harus ada satu gambar.";

  return null; // Tidak ada error
};
