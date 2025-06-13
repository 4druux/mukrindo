"use client";
import React, { createContext, useContext, useCallback } from "react";
import useSWR from "swr";
import isEqual from "lodash/isEqual";
import axiosInstance from "@/utils/axiosInstance";

const TrafficContext = createContext();

export const useTraffic = () => {
  const context = useContext(TrafficContext);
  if (!context) {
    throw new Error("useTraffic must be used within a TrafficProvider");
  }
  return context;
};

const STATS_API_PATH = "/visits/homepage/stats";
const TRACK_API_PATH = "/visits/homepage/track";
const HISTORY_API_PATH = "/visits/homepage/history";

const fetcher = (path) => axiosInstance.get(path).then((res) => res.data);

// const fetcher = async (path) => {
//   await new Promise((resolve) => setTimeout(resolve, 120000000));

//   const res = await axiosInstance.get(path);
//   return res.data;
// };

export const TrafficProvider = ({ children }) => {
  const {
    data: rawTrafficStats,
    error: rawStatsError,
    isLoading: statsLoading,
    mutate: mutateTrafficStats,
  } = useSWR(STATS_API_PATH, fetcher, {
    revalidateOnFocus: true,
    compare: (a, b) => {
      if (a === b) return true;
      if (a === undefined || b === undefined) return false;
      return isEqual(a, b);
    },
  });

  const trafficStats = rawTrafficStats;
  const statsError = rawStatsError
    ? rawStatsError.response?.data?.message ||
      rawStatsError.message ||
      "Gagal memuat statistik trafik."
    : null;

  const getTrafficHistory = useCallback((period, year) => {
    return fetcher(`${HISTORY_API_PATH}?period=${period}&year=${year}`);
  }, []);

  const trackHomepageVisit = useCallback(async () => {
    try {
      const response = await axiosInstance.post(
        TRACK_API_PATH,
        {},
        { withCredentials: true }
      );
      return {
        success: response.status === 200 || response.status === 201,
        data: response.data,
      };
    } catch (error) {
      console.error(
        "Error in trackHomepageVisit:",
        error.response?.data || error.message || error
      );
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Network error during visit tracking",
      };
    }
  }, []);

  const contextValue = {
    trafficStats,
    statsLoading,
    statsError,
    mutateTrafficStats,
    trackHomepageVisit,
    getTrafficHistory,
  };

  return (
    <TrafficContext.Provider value={contextValue}>
      {children}
    </TrafficContext.Provider>
  );
};
