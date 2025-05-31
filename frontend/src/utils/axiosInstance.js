// frontend/src/utils/axiosInstance.js
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  console.error(
    "FATAL ERROR: NEXT_PUBLIC_API_URL is not defined in your environment variables."
  );
}

const axiosInstance = axios.create({
  baseURL: baseURL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    // 1. Tambahkan X-API-Key
    const apiKey = process.env.NEXT_PUBLIC_BACKEND_API_KEY;
    if (apiKey) {
      config.headers["X-API-Key"] = apiKey;
    } else {
      console.warn("Frontend: NEXT_PUBLIC_BACKEND_API_KEY is not set.");
    }

    const token = localStorage.getItem("mukrindoAuthToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("API Error Response:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);

      if (error.response.status === 401 || error.response.status === 403) {
        console.warn(
          "Akses ditolak atau token tidak valid. Pengguna mungkin perlu login ulang."
        );
      }
    } else if (error.request) {
      console.error("API No Response:", error.request);
    } else {
      console.error("API Error Message:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
