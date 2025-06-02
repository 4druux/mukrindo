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
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const { data } = await axiosInstance.get(
        `${AUTH_API_PATH}/profile`,
        config
      );
      // PASTIKAN BACKEND MENGIRIMKAN 'hasPassword'
      setUser({
        _id: data._id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        hasPassword: data.hasPassword || false, // TAMBAHKAN INI
      });
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
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("mukrindoAuthToken");
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data } = await axiosInstance.post(`${AUTH_API_PATH}/login`, {
        email,
        password,
      });

      const params = new URLSearchParams();
      params.append("token", data.token);
      params.append("role", data.role);
      params.append("userId", data._id);
      params.append("firstName", data.firstName || "");
      params.append("email", data.email);
      if (data.avatar) {
        params.append("avatar", data.avatar);
      }
      // loginType akan digunakan di callback untuk menentukan hasPassword
      params.append("loginType", "manual");

      router.push(`/auth/callback?${params.toString()}`);
      return { success: true, redirectedToCallback: true };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Login gagal.";
      setAuthError(message);
      toast.error(message, { className: "custom-toast" });
      setUser(null);
      setLoading(false);
      return { success: false, error: message };
    }
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
      localStorage.setItem("mukrindoAuthToken", data.token);
      // Saat registrasi, pengguna pasti punya password manual
      setUser({
        _id: data._id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        hasPassword: true, // TAMBAHKAN INI
      });
      toast.success(data.message || "Registrasi berhasil!", {
        className: "custom-toast",
      });
      router.push("/");
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
    setLoading(false);
    toast.success("Logout berhasil.", { className: "custom-toast" });
    router.push("/login");
  };

  const handleOAuthSuccess = useCallback(
    (oauthData) => {
      // oauthData dari query params di halaman /auth/callback
      localStorage.setItem("mukrindoAuthToken", oauthData.token);
      const userData = {
        _id: oauthData.userId,
        firstName: oauthData.firstName,
        lastName: oauthData.lastName || "",
        email: oauthData.email,
        role: oauthData.role,
        avatar: oauthData.avatar || null,
        // Tentukan hasPassword berdasarkan loginType yang diterima dari callback
        // loginType bisa 'manual', 'google', dll.
        hasPassword: oauthData.loginType === "manual", // TAMBAHKAN INI
      };
      setUser(userData);
      setAuthError(null);
      setLoading(false);

      if (oauthData.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    },
    [router]
  );

  const updateUser = async (formDataToSubmit) => {
    // Ganti nama parameter
    setLoading(true);
    setAuthError(null);
    try {
      const token = localStorage.getItem("mukrindoAuthToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };
      const { data } = await axiosInstance.put(
        `${AUTH_API_PATH}/profile`,
        formDataToSubmit, // Gunakan parameter yang diganti namanya
        config
      );

      // PASTIKAN BACKEND MENGIRIMKAN 'hasPassword' setelah update juga
      setUser({
        _id: data._id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        hasPassword: data.hasPassword || user?.hasPassword || false, // Pertahankan atau update hasPassword
      });
      toast.success(data.message || "Profil berhasil diperbarui!", {
        className: "custom-toast",
      });
      setLoading(false);
      return { success: true, user: data };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Gagal memperbarui profil.";
      setAuthError(message);
      toast.error(message, { className: "custom-toast" });
      setLoading(false);
      return { success: false, error: message };
    }
  };

  const contextValue = {
    user,
    loading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    fetchUserProfile,
    handleOAuthSuccess,
    updateUser,
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user",
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
