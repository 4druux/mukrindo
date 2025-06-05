// frontend/src/utils/uploadCloudinary.js
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
    throw error;
  }
}

export async function uploadMultipleImagesToCloudinary(
  files,
  folder = "mukrindo_products",
  onProgress
) {
  const uploadedUrls = [];
  if (!Array.isArray(files) || files.length === 0) {
    return uploadedUrls;
  }

  for (let i = 0; i < files.length; i++) {
    const fileToUpload = files[i];
    if (!(fileToUpload instanceof File || fileToUpload instanceof Blob)) {
      console.warn(
        `Item ke-${i} bukan File atau Blob, dilewati:`,
        fileToUpload
      );
      continue;
    }

    if (onProgress) {
      onProgress(i, files.length);
    }
    try {
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
