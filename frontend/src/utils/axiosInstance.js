// frontend/src/utils/axiosInstance.js
import axios from "axios";

// Ambil API URL dari environment variable.
// Pastikan NEXT_PUBLIC_API_URL di .env.local Anda adalah http://localhost:5000 untuk development
// dan URL backend produksi Anda untuk production.
const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  console.error(
    "FATAL ERROR: NEXT_PUBLIC_API_URL is not defined in your environment variables."
  );
}

const axiosInstance = axios.create({
  baseURL: baseURL, // Contoh: http://localhost:5000 atau https://mukrindo-backend.vercel.app
});

// Interceptor untuk menambahkan X-API-Key ke setiap request
axiosInstance.interceptors.request.use(
  (config) => {
    const apiKey = process.env.NEXT_PUBLIC_BACKEND_API_KEY;
    if (apiKey) {
      config.headers["X-API-Key"] = apiKey;
    } else {
      console.warn("Frontend: NEXT_PUBLIC_BACKEND_API_KEY is not set.");
    }
    // Jika Anda punya sistem login admin, token JWT juga bisa ditambahkan di sini
    // const adminToken = localStorage.getItem('adminAuthToken');
    // if (adminToken) {
    //   config.headers.Authorization = `Bearer ${adminToken}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk response (opsional, tapi baik untuk logging global)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server merespons dengan status error (4xx, 5xx)
      console.error("API Error Response:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      // Request dibuat tapi tidak ada respons (misal, network error)
      console.error("API No Response:", error.request);
    } else {
      // Error lain saat setup request
      console.error("API Error Message:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
