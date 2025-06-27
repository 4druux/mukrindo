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
import useSWR from "swr";
import isEqual from "lodash/isEqual";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AUTH_API_PATH = "/auth";

const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const router = useRouter();

  const {
    data: usersData,
    error: usersSwrError,
    isLoading: usersSwrLoading,
  } = useSWR(
    user?.role === "admin" ? `${AUTH_API_PATH}/users` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      compare: (a, b) => isEqual(a, b),
    }
  );

  const allUsers = usersData || [];
  const usersLoading = usersSwrLoading;
  const usersError = usersSwrError
    ? usersSwrError.response?.data?.message ||
      usersSwrError.message ||
      "Gagal memuat data pengguna."
    : null;

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

      if (data.otpRequired) {
        setLoading(false);
        router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        return { success: true, otpRequired: true };
      }

      localStorage.setItem("mukrindoAuthToken", data.token);
      window.location.href = "/";

      return { success: true };
    } catch (error) {
      const err = error.response?.data || {};
      const backendCode = [
        "INVALID_CREDENTIALS",
        "ACCOUNT_LOCKED",
        "SERVER_ERROR",
      ];
      const code = backendCode.includes(err.error) ? err.error : "SERVER_ERROR";
      setAuthError(code);
      setLoading(false);

      return { success: false, error: code };
    }
  };

  const register = async (firstName, lastName, email, password, role) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data } = await axiosInstance.post(`${AUTH_API_PATH}/register`, {
        firstName,
        lastName,
        email,
        password,
        role,
      });

      localStorage.setItem("mukrindoAuthToken", data.token);
      if (data.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }

      return { success: true };
    } catch (error) {
      const err = error.response?.data || {};
      const backendCode = ["EMAIL_TAKEN", "ADMIN_REG_LIMIT", "SERVER_ERROR"];
      const code = backendCode.includes(err.error) ? err.error : "SERVER_ERROR";
      setAuthError(code);
      setLoading(false);

      return { success: false, error: code };
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setAuthError(null);

    try {
      const { data } = await axiosInstance.post(
        `${AUTH_API_PATH}/forgot-password`,
        { email }
      );

      setLoading(false);
      return { success: data.success === true, error: null };
    } catch (error) {
      const err = error.response?.data?.error;
      const backendCode = ["SERVER_ERROR"];
      const code = backendCode.includes(err) ? err : "SERVER_ERROR";

      setAuthError(code);
      setLoading(false);
      return { success: false, error: code };
    }
  };

  const resetPassword = async (token, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data } = await axiosInstance.put(
        `${AUTH_API_PATH}/reset-password/${token}`,
        { password }
      );
      setLoading(false);
      router.push("/login");
      return { success: data.success === true };
    } catch (error) {
      const err = error.response?.data?.error;
      const backendCodes = ["INVALID_TOKEN", "SERVER_ERROR"];
      const code = backendCodes.includes(err) ? err : "SERVER_ERROR";
      setAuthError(code);
      setLoading(false);
      return { success: false, error: code };
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

  const handleOAuthSuccess = useCallback((oauthData) => {
    localStorage.setItem("mukrindoAuthToken", oauthData.token);
    if (oauthData.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/";
    }
  }, []);

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

  const verifyOtp = async (email, otp) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data } = await axiosInstance.post(`${AUTH_API_PATH}/verify-otp`, {
        email,
        otp,
      });

      localStorage.setItem("mukrindoAuthToken", data.token);

      window.location.href = "/admin";

      return { success: true, user: data };
    } catch (error) {
      const err = error.response?.data?.error;
      const validCodes = ["INVALID_OTP", "SERVER_ERROR"];
      const code = validCodes.includes(err) ? err : "SERVER_ERROR";
      setAuthError(code);
      setLoading(false);
      return { success: false, error: code };
    }
  };

  const resendOtp = async (email) => {
    setAuthError(null);
    try {
      const { data } = await axiosInstance.post(`${AUTH_API_PATH}/resend-otp`, {
        email,
      });
      return { success: data.success === true, retryAfter: data.retryAfter };
    } catch (error) {
      const err = error.response?.data?.error;
      const validCodes = [
        "EMAIL_NOT_FOUND",
        "RESEND_LIMIT_EXCEEDED",
        "RESEND_TOO_SOON",
        "SERVER_ERROR",
      ];
      const code = validCodes.includes(err) ? err : "SERVER_ERROR";
      const retryAfter = error.response?.data?.retryAfter;
      setAuthError(code);
      return { success: false, error: code, retryAfter };
    }
  };

  const contextValue = {
    user,
    loading,
    setLoading,
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
    allUsers,
    usersLoading,
    usersError,
    forgotPassword,
    resetPassword,
    verifyOtp,
    resendOtp,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
