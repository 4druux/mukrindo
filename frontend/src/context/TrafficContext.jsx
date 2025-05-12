"use client";
import React, { createContext, useContext, useCallback } from "react";
import axios from "axios";
import useSWR from "swr";
import isEqual from "lodash/isEqual";

const TrafficContext = createContext();

export const useTraffic = () => {
  const context = useContext(TrafficContext);
  if (!context) {
    throw new Error("useTraffic must be used within a TrafficProvider");
  }
  return context;
};

const STATS_API_ENDPOINT = "http://localhost:5000/api/visits/homepage/stats";
const TRACK_API_ENDPOINT = "http://localhost:5000/api/visits/homepage/track";

const fetcher = (url) =>
  axios.get(url, { credentials: "include" }).then((res) => res.data);

export const TrafficProvider = ({ children }) => {
  const {
    data: trafficStats,
    error: statsError,
    isLoading: statsLoading,
    mutate: mutateTrafficStats,
  } = useSWR(STATS_API_ENDPOINT, fetcher, {
    revalidateOnFocus: true,
    // refreshInterval: 60000, // Opsional: refresh setiap 1 menit
    compare: (a, b) => {
      if (a === b) return true;
      if (a === undefined || b === undefined) return false;
      return isEqual(a, b);
    },
  });

  const trackHomepageVisit = useCallback(async () => {
    try {
      const response = await axios.post(
        TRACK_API_ENDPOINT,
        {},
        {
          withCredentials: true,
        }
      );
      if (response.status === 200 || response.status === 201) {
        console.log("Homepage visit tracked successfully by context.");

        return { success: true, data: response.data };
      } else {
        console.error(
          "Failed to track homepage visit via context:",
          response.statusText
        );
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error tracking homepage visit via context";
      console.error("Track Homepage Visit Error (Context):", errorMessage);
      return { success: false, error: errorMessage };
    }
  });

  const contextValue = {
    trafficStats,
    statsLoading,
    statsError,
    mutateTrafficStats,
    trackHomepageVisit,
  };

  return (
    <TrafficContext.Provider value={contextValue}>
      {children}
    </TrafficContext.Provider>
  );
};
