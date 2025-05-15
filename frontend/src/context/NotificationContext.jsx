"use client";
import { createContext, useContext } from "react";
import axios from "axios";
import useSWR from "swr";
import isEqual from "lodash/isEqual";

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

const fetcher = (url) => axios.get(url).then((res) => res.data);

const API_ENDPOINT = "http://localhost:5000/api/notifications";

export const NotificationProvider = ({ children }) => {
  const {
    data,
    error: swrError,
    isLoading: swrLoading,
    mutate,
  } = useSWR(API_ENDPOINT, fetcher, {
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
      await axios.delete(API_ENDPOINT);
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
          axios.patch(`${API_ENDPOINT}/${n._id}/read`)
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
      await axios.patch(`${API_ENDPOINT}/${id}/read`);
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
