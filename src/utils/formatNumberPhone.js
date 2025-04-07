// utils/formatNumberPhone.js

// Fungsi untuk memformat nomor telepon saat pengguna mengetik
export const formatNumberPhone = (value) => {
  if (!value) return value;

  // Hapus semua karakter non-digit kecuali jika itu adalah awal dari string kosong setelah prefix
  const phoneNumber = value.replace(/\D/g, "");

  // Batasi panjang nomor telepon (misalnya, maksimal 13 digit setelah 0/8)
  const maxLength = 13;
  const truncatedPhoneNumber = phoneNumber.slice(0, maxLength);

  // Terapkan format XXXX-XXXX-XXXX...
  let formattedNumber = "";
  if (truncatedPhoneNumber.length > 0) {
    formattedNumber += truncatedPhoneNumber.substring(0, 4);
  }
  if (truncatedPhoneNumber.length > 4) {
    formattedNumber += "-" + truncatedPhoneNumber.substring(4, 8);
  }
  if (truncatedPhoneNumber.length > 8) {
    formattedNumber += "-" + truncatedPhoneNumber.substring(8);
  }

  return formattedNumber;
};

// Fungsi untuk menghapus format dan prefix, mengembalikan hanya digit
export const unformatNumberPhone = (value) => {
  if (!value) return "";
  // Hapus prefix "+62 " dan semua karakter non-digit
  return value.replace(/^\+62\s*/, "").replace(/\D/g, "");
};
