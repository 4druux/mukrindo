"use client";

import React, { createContext, useState, useContext } from "react";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";

const TradeInContext = createContext();

export const useTradeIn = () => useContext(TradeInContext);

const TRADE_IN_API_PATH = "/api/trade-in";

export const TradeInProvider = ({ children }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submitTradeInRequest = async (submissionData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Kirim data ke backend
      const response = await axiosInstance.post(
        TRADE_IN_API_PATH,
        submissionData
      );

      if (response.status === 201) {
        // 201 Created biasanya untuk POST sukses
        setSubmitSuccess(true);
        toast.success("Permintaan tukar tambah berhasil dikirim!", {
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
        "Terjadi kesalahan saat mengirim permintaan tukar tambah.";
      console.error("Trade-In Submission Error:", error);
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
    submitTradeInRequest,
    resetSubmitStatus,
  };

  return (
    <TradeInContext.Provider value={contextValue}>
      {children}
    </TradeInContext.Provider>
  );
};
