// frontend/src/context/AuthContext.jsx
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AUTH_API_PATH = "/api/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const router = useRouter();

  const fetchUserProfile = useCallback(async (token) => {
    // setLoading(true); // Mungkin tidak perlu di sini jika hanya refresh profil
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const { data } = await axiosInstance.get(
        `${AUTH_API_PATH}/profile`,
        config
      );
      setUser(data);
      setAuthError(null);
      return data;
    } catch (error) {
      localStorage.removeItem("mukrindoAuthToken");
      setUser(null);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Gagal mengambil profil.";
      console.error("Fetch Profile Error:", message);
      // Tidak set authError di sini agar tidak persisten
      return null;
    } finally {
      // setLoading(false); // Hanya set false jika ini loading utama
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("mukrindoAuthToken");
    if (token) {
      fetchUserProfile(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const login = async (email, password) => {
    setLoading(true); // Mulai loading untuk proses login
    setAuthError(null);
    try {
      const { data } = await axiosInstance.post(`${AUTH_API_PATH}/login`, {
        email,
        password,
      });

      // **PERUBAHAN DI SINI:** Arahkan ke /auth/callback
      const params = new URLSearchParams();
      params.append("token", data.token);
      params.append("role", data.role);
      params.append("userId", data._id);
      params.append("firstName", data.firstName || "");
      params.append("email", data.email);
      params.append("loginType", "manual"); // Penanda login manual
      params.append("message", "Login manual berhasil!"); // Pesan kustom

      router.push(`/auth/callback?${params.toString()}`);
      // Jangan set user/token di sini, biarkan callback page yang memanggil handleOAuthSuccess
      return { success: true, redirectedToCallback: true };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Login gagal.";
      setAuthError(message);
      toast.error(message, { className: "custom-toast" });
      setUser(null); // Pastikan user null jika error
      setLoading(false); // Hentikan loading jika error di sini
      return { success: false, error: message };
    }
    // setLoading(false) akan di-handle oleh handleOAuthSuccess atau jika error di atas
  };

  const register = async (firstName, lastName, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data } = await axiosInstance.post(`${AUTH_API_PATH}/register`, {
        firstName,
        lastName,
        email,
        password,
      });
      // Setelah registrasi, kita juga bisa arahkan ke callback untuk konsistensi
      // atau langsung proses seperti login manual baru.
      // Untuk saat ini, biarkan register mengarahkan langsung ke homepage setelah set token & user.
      // Jika ingin lewat callback, modifikasinya mirip dengan fungsi login di atas.
      localStorage.setItem("mukrindoAuthToken", data.token);
      setUser({
        _id: data._id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
      });
      toast.success(data.message || "Registrasi berhasil!", {
        className: "custom-toast",
      });
      router.push("/"); // User baru selalu ke homepage
      return { success: true, user: data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Registrasi gagal.";
      setAuthError(message);
      toast.error(message, { className: "custom-toast" });
      setUser(null);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("mukrindoAuthToken");
    setUser(null);
    setAuthError(null);
    setLoading(false); // Pastikan loading false saat logout
    toast.success("Logout berhasil.", { className: "custom-toast" });
    router.push("/login");
  };

  const handleOAuthSuccess = useCallback(
    // Diubah nama parameter menjadi authData
    (authData) => {
      localStorage.setItem("mukrindoAuthToken", authData.token);
      const userData = {
        _id: authData._id,
        firstName: authData.firstName,
        // lastName: authData.lastName || '', // Jika ada
        email: authData.email,
        role: authData.role,
      };
      setUser(userData);
      setAuthError(null); // Hapus error sebelumnya
      setLoading(false); // **PENTING**: Hentikan loading di sini

      toast.success(authData.message || "Login berhasil!", {
        className: "custom-toast",
      });

      if (authData.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    },
    [router] // router sebagai dependensi
  );

  const contextValue = {
    user,
    loading,
    authError,
    login,
    register,
    logout,
    fetchUserProfile,
    handleOAuthSuccess,
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user",
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
