// frontend/src/utils/uploadCloudinary.js

/**
 * Mengunggah satu file gambar ke Cloudinary.
 * @param {File} file - File gambar yang akan diunggah.
 * @param {string} folder - Nama folder di Cloudinary tempat gambar akan disimpan (opsional, default: 'mukrindo_products').
 * @returns {Promise<string>} URL gambar yang aman dari Cloudinary.
 * @throws {Error} Jika upload gagal atau variabel lingkungan tidak diset.
 */
export async function uploadCloudinary(file, folder = "mukrindo_products") {
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!uploadPreset || !cloudName) {
    console.error(
      "Variabel lingkungan Cloudinary (NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET atau NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) belum diatur di frontend."
    );
    throw new Error("Konfigurasi Cloudinary tidak lengkap di frontend.");
  }

  if (!file) {
    throw new Error("File tidak ditemukan untuk diunggah.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  if (folder) {
    formData.append("folder", folder);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    } else {
      console.error("Cloudinary upload error response:", data);
      throw new Error(
        data.error?.message || "Upload Cloudinary gagal, tidak ada secure_url."
      );
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    // Melempar kembali error agar bisa ditangani di komponen pemanggil
    throw error;
  }
}

/**
 * Mengunggah beberapa file gambar ke Cloudinary secara sekuensial.
 * @param {File[]} files - Array file gambar yang akan diunggah (objek File hasil cropping).
 * @param {string} folder - Nama folder di Cloudinary (opsional, default: 'mukrindo_products').
 * @param {function} [onProgress] - Callback untuk update progress (opsional), menerima (currentIndex, totalFiles).
 * @returns {Promise<string[]>} Array URL gambar yang aman dari Cloudinary.
 * @throws {Error} Jika salah satu upload gagal.
 */
export async function uploadMultipleImagesToCloudinary(
  files,
  folder = "mukrindo_products",
  onProgress
) {
  const uploadedUrls = [];
  if (!Array.isArray(files) || files.length === 0) {
    return uploadedUrls; // Kembalikan array kosong jika tidak ada file
  }

  for (let i = 0; i < files.length; i++) {
    const fileToUpload = files[i];
    if (!(fileToUpload instanceof File || fileToUpload instanceof Blob)) {
      console.warn(
        `Item ke-${i} bukan File atau Blob, dilewati:`,
        fileToUpload
      );
      // Anda bisa memilih untuk melempar error atau melanjutkan
      // throw new Error(`Item ke-${i} tidak valid untuk diunggah.`);
      continue; // Lewati item yang tidak valid
    }

    if (onProgress) {
      onProgress(i, files.length); // Memberikan info progress: file ke-i dari total files
    }
    try {
      // Pastikan fileToUpload adalah objek File yang benar (hasil dari cropping)
      const url = await uploadCloudinary(fileToUpload, folder);
      uploadedUrls.push(url);
    } catch (error) {
      console.error(
        `Gagal mengunggah file ke-${i + 1}: "${
          fileToUpload.name || "tanpa nama"
        }"`,
        error
      );
      throw new Error(
        `Gagal mengunggah gambar "${fileToUpload.name || "tanpa nama"}". ${
          error.message || "Silakan coba lagi."
        }`
      );
    }
  }
  if (onProgress) {
    onProgress(files.length, files.length);
  }
  return uploadedUrls;
}
