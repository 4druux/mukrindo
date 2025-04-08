// utils/formatNumberPhone.js

export const formatNumberPhone = (value, prefix = "") => {
  if (!value) return prefix;

  // Pastikan value adalah string sebelum memanipulasinya
  let phoneNumber = String(value);

  // Hapus prefix jika ada di awal (ini sudah benar)
  if (prefix && phoneNumber.startsWith(prefix)) {
    phoneNumber = phoneNumber.substring(prefix.length);
  }
  // Hapus semua karakter non-digit
  phoneNumber = phoneNumber.replace(/\D/g, "");

  // Batasi panjang nomor (tanpa prefix)
  const maxLength = 12;
  const truncatedPhoneNumber = phoneNumber.slice(0, maxLength);

  // Format dengan tanda hubung
  let formattedDigits = "";
  if (truncatedPhoneNumber.length > 0) {
    formattedDigits += truncatedPhoneNumber.substring(0, 3);
  }
  if (truncatedPhoneNumber.length > 3) {
    formattedDigits += "-" + truncatedPhoneNumber.substring(3, 7);
  }
  if (truncatedPhoneNumber.length > 7) {
    formattedDigits += "-" + truncatedPhoneNumber.substring(7);
  }

  // Kembalikan prefix + nomor terformat HANYA jika ada digit setelah pembersihan
  // Jika tidak ada digit (formattedDigits kosong), kembalikan prefix saja.
  return formattedDigits ? `${prefix}${formattedDigits}` : prefix;
};

export const unformatNumberPhone = (value, prefix = "") => {
  if (!value) return "";

  let phoneNumber = String(value); // Pastikan string
  const prefixDigits = prefix ? prefix.replace(/\D/g, "") : ""; // Dapatkan digit dari prefix, misal "62"

  // 1. Cek jika input dimulai PERSIS dengan prefix (termasuk spasi jika ada)
  if (prefix && phoneNumber.startsWith(prefix)) {
    // Ambil bagian setelah prefix dan hapus non-digit
    return phoneNumber.substring(prefix.length).replace(/\D/g, "");
  }

  // 2. Jika tidak dimulai dengan prefix persis (misal karena backspace menghapus spasi),
  //    cek apakah digit dalam input SAMA PERSIS dengan digit dalam prefix.
  const valueDigits = phoneNumber.replace(/\D/g, "");
  if (prefixDigits && valueDigits === prefixDigits) {
    // Jika ya, berarti pengguna menghapus kembali ke kondisi hanya prefix.
    // Kembalikan string kosong agar formatNumberPhone hanya menampilkan prefix.
    return "";
  }

  // 3. Jika tidak cocok dengan kondisi di atas, berarti ada digit lain atau format berbeda.
  //    Kembalikan semua digit yang ditemukan di input.
  return valueDigits;
};
