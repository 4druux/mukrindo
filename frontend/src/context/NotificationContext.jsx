"use client";

import React, { createContext, useState, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

const API_ENDPOINT = "http://localhost:5000/api/notifications";

export const NotificationProvider = ({ children }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submitNotificationRequest = async (submissionData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    console.log("Submitting notification request:", submissionData);

    try {
      const response = await axios.post(API_ENDPOINT, submissionData);

      if (response.status === 201) {
        setSubmitSuccess(true);
        toast.success(
          response.data?.message || "Permintaan notifikasi berhasil dikirim!",
          {
            className: "custom-toast",
            duration: 5000,
          }  
        );
        return { success: true, data: response.data };
      } else {
        throw new Error(
          response.data?.message || "Gagal mengirim permintaan notifikasi"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan saat mengirim permintaan notifikasi.";
      console.error(
        "Notification Submission Error:",
        error.response?.data || error
      );
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
    submitNotificationRequest,
    resetSubmitStatus,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
