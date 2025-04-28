// utils/generateSlug.js
const generateSlug = (text, id = null) => {
  // Ubah carName -> text, buat id opsional
  if (!text) return ""; // Tambahkan pengecekan jika text kosong

  const cleanedText = String(text) // Pastikan input adalah string
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Ganti karakter non-alphanumeric dengan '-'
    .replace(/^-+|-+$/g, ""); // Hapus '-' di awal/akhir

  // Kembalikan slug dengan ID jika ID ada, jika tidak hanya cleanedText
  return id ? `${cleanedText}-${id}` : cleanedText;
};

export default generateSlug;
