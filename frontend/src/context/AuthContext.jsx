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
      setUser({
        _id: data._id,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email,
        role: data.role,
        avatar: data.avatar || null,
        hasPassword: data.hasPassword || false,
      });
      setAuthError(null);
      return data;
    } catch (error) {
      localStorage.removeItem("mukrindoAuthToken");
      setUser(null);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Sesi Anda mungkin telah berakhir. Silakan login kembali.";
      console.error("Fetch Profile Error:", message);
      if (error.response?.status !== 401) {
        setAuthError(message);
      }
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
      setUser(null);
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
      params.append("lastName", data.lastName || "");
      params.append("email", data.email);
      params.append("hasPassword", String(data.hasPassword || true));
      params.append("loginType", "manual");
      if (data.avatar) {
        params.append("avatar", data.avatar);
      }
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
      setUser({
        _id: data._id,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email,
        role: data.role,
        avatar: data.avatar || null,
        hasPassword: data.hasPassword,
      });
      toast.success(data.message || "Registrasi berhasil!", {
        className: "custom-toast",
      });
      setLoading(false);
      router.push("/");
      return { success: true, user: data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Registrasi gagal.";
      setAuthError(message);
      toast.error(message, { className: "custom-toast" });
      setUser(null);
      setLoading(false);
      return { success: false, error: message };
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
      localStorage.setItem("mukrindoAuthToken", oauthData.token);
      const userData = {
        _id: oauthData.userId,
        firstName: oauthData.firstName || "",
        lastName: oauthData.lastName || "",
        email: oauthData.email,
        role: oauthData.role,
        avatar: oauthData.avatar || null,
        hasPassword: oauthData.hasPassword === "true",
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
        formDataToSubmit,
        config
      );

      setUser((prevUser) => ({
        ...(prevUser || {}),
        _id: data._id,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email,
        role: data.role,
        avatar: data.avatar || null,
        hasPassword: data.hasPassword,
      }));
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
