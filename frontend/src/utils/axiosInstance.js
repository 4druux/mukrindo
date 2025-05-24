// frontend/src/utils/axiosInstance.js
import axios from "axios";

const baseURL = process.env.NEXT_API_URL;

if (!baseURL) {
  console.error(
    "FATAL ERROR: NEXT_API_URL is not defined in your environment variables."
  );
}

const axiosInstance = axios.create({
  baseURL: baseURL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const apiKey = process.env.NEXT_BACKEND_API_KEY;
    if (apiKey) {
      config.headers["X-API-Key"] = apiKey;
    } else {
      console.warn("Frontend: NEXT_BACKEND_API_KEY is not set.");
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
    } else if (error.request) {
      console.error("API No Response:", error.request);
    } else {
      console.error("API Error Message:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
