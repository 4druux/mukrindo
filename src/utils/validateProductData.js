// utils/validation.js
export const validateProductData = (productData, mediaFiles) => {
    if (!productData.carName.trim()) {
      return "Nama mobil harus diisi.";
    }
    if (!productData.brand.trim()) {
      return "Merek mobil harus diisi.";
    }
    if (
      !productData.yearOfAssembly.trim() ||
      isNaN(parseInt(productData.yearOfAssembly))
    ) {
      return "Tahun perakitan harus diisi dan berupa angka.";
    }
    if (mediaFiles.length === 0) {
      return "Please upload an image.";
    }
    if (mediaFiles[0]?.cropped && mediaFiles[0].cropped.type !== "image/jpeg") {
      return "Please upload a JPEG image.";
    }
    return null; // No errors
  };
  