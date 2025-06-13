"use client";
import { createContext, useContext } from "react";
import useSWR from "swr";
import isEqual from "lodash/isEqual";
import axiosInstance from "@/utils/axiosInstance";

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

const NOTIFICATION_API_PATH = "/notifications";

export const NotificationProvider = ({ children }) => {
  const {
    data,
    error: swrError,
    isLoading: swrLoading,
    mutate,
  } = useSWR(NOTIFICATION_API_PATH, fetcher, {
    revalidateOnFocus: true,
    compare: (a, b) => {
      if (a === b) return true;
      if (a === undefined || b === undefined) return false;
      return isEqual(a, b);
    },
  });

  const notifications = data || [];
  const loading = swrLoading;
  const error = swrError;

  const deleteAllNotifications = async () => {
    try {
      await axiosInstance.delete(NOTIFICATION_API_PATH);
      mutate([]);
      return { success: true };
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      return { success: false, error: "Failed to delete notifications" };
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      await Promise.all(
        unreadNotifications.map((n) =>
          axiosInstance.patch(`${NOTIFICATION_API_PATH}/${n._id}/read`)
        )
      );
      mutate();
      return { success: true };
    } catch (error) {
      console.error("Error marking all as read:", error);
      return { success: false, error: "Failed to mark all as read" };
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosInstance.patch(`${NOTIFICATION_API_PATH}/${id}/read`);
      mutate();
      return { success: true };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return { success: false, error: "Failed to mark as read" };
    }
  };

  const contextValue = {
    notifications,
    loading,
    error,
    mutateNotifications: mutate,
    deleteAllNotifications,
    markAllAsRead,
    markAsRead,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
