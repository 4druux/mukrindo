"use client";

import React, { createContext, useState, useContext } from "react";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";

const BuySellContext = createContext();

export const useBuySell = () => useContext(BuySellContext);

// Sesuaikan dengan endpoint backend Anda untuk jual mobil
const BUYSELL_API_PATH = "/sell-requests";

export const BuySellProvider = ({ children }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submitSellRequest = async (submissionData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Kirim data ke backend
      const response = await axiosInstance.post(
        BUYSELL_API_PATH,
        submissionData
      );

      if (response.status === 201) {
        // 201 Created biasanya untuk POST sukses
        setSubmitSuccess(true);
        toast.success("Permintaan jual mobil berhasil dikirim!", {
          className: "custom-toast",
        });
        // Anda bisa tambahkan logic lain di sini, misal reset form atau redirect
        return { success: true, data: response.data };
      } else {
        // Handle unexpected success status codes if necessary
        throw new Error(response.data.message || "Gagal mengirim permintaan");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan saat mengirim permintaan jual mobil.";
      console.error("Sell Car Submission Error:", error);
      setSubmitError(errorMessage);
      toast.error(errorMessage, { className: "custom-toast" });
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSubmitStatus = () => {
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const contextValue = {
    isSubmitting,
    submitError,
    submitSuccess,
    submitSellRequest, // Ganti nama fungsi
    resetSubmitStatus,
  };

  return (
    <BuySellContext.Provider value={contextValue}>
      {children}
    </BuySellContext.Provider>
  );
};
