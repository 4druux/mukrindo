// utils/validateProductData.js
export const validateProductData = (productData, mediaFiles) => {
  const errors = {}; // Inisialisasi objek error kosong
  const requiredMessage = "Wajib di Isi"; // Pesan error standar

  const {
    carName,
    brand,
    model,
    variant,
    type,
    numberOfSeats,
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
  } = productData;

  if (!carName) errors.carName = requiredMessage;
  if (!brand) errors.brand = requiredMessage;
  if (!model) errors.model = requiredMessage;
  if (!variant) errors.variant = requiredMessage;
  if (!type) errors.type = requiredMessage;
  if (!numberOfSeats) errors.numberOfSeats = requiredMessage;
  if (!carColor) errors.carColor = requiredMessage;
  if (!cc) errors.cc = requiredMessage;
  if (!travelDistance) errors.travelDistance = requiredMessage;
  if (!driveSystem) errors.driveSystem = requiredMessage;
  if (!transmission) errors.transmission = requiredMessage;
  if (!fuelType) errors.fuelType = requiredMessage;
  if (!stnkExpiry) errors.stnkExpiry = requiredMessage;
  if (!plateNumber) errors.plateNumber = requiredMessage;
  if (!yearOfAssembly) errors.yearOfAssembly = requiredMessage;
  if (!price) errors.price = requiredMessage;

  // Validasi status (jika perlu, misal memastikan nilainya valid)
  // if (status && !["Tersedia", "Terjual"].includes(status)) errors.status = "Status tidak valid";

  // Validasi gambar tetap ada
  if (mediaFiles.length === 0) {
    errors.mediaFiles = "Minimal harus ada satu gambar.";
  } else {
    // Cek apakah semua gambar sudah di-crop (jika validasi ini masih relevan saat submit)
    const uncropped = mediaFiles.some((file) => !file.cropped);
    if (uncropped) {
      errors.mediaFiles = "Selesaikan proses crop untuk semua gambar.";
      // Atau bisa juga error spesifik per gambar jika state memungkinkan
    }
  }

  return errors; // Kembalikan objek errors
};
