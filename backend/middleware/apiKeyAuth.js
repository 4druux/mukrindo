// middleware/apiKeyAuth.js
const BACKEND_API_KEY = process.env.BACKEND_API_KEY;

const apiKeyAuth = (req, res, next) => {
  const providedApiKey = req.headers["x-api-key"];

  if (!BACKEND_API_KEY) {
    // Penting: Di produksi, BACKEND_API_KEY harus ada.
    // Jika tidak diset, blokir semua akses API atau log error serius.
    // Untuk pengembangan, Anda bisa memilih untuk melewatkan ini, tapi tidak disarankan.
    console.error("Kesalahan Kritis: BACKEND_API_KEY tidak diset di server.");
    return res.status(500).json({ message: "Konfigurasi server error." });
  }

  if (!providedApiKey || providedApiKey !== BACKEND_API_KEY) {
    return res.status(401).json({ message: "Akses API tidak sah." });
  }
  next();
};

module.exports = apiKeyAuth;
