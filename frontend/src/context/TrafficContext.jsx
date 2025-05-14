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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const STATS_API_ENDPOINT = `${API_BASE_URL}/api/visits/homepage/stats`;
const TRACK_API_ENDPOINT = `${API_BASE_URL}/api/visits/homepage/track`;
const HISTORY_API_ENDPOINT = `${API_BASE_URL}/api/visits/homepage/history`;

const fetcher = (url) =>
  axios.get(url, { withCredentials: true }).then((res) => res.data);

export const TrafficProvider = ({ children }) => {
  const {
    data: trafficStats,
    error: statsError,
    isLoading: statsLoading,
    mutate: mutateTrafficStats,
  } = useSWR(STATS_API_ENDPOINT, fetcher, {
    revalidateOnFocus: true,
    compare: (a, b) => {
      if (a === b) return true;
      if (a === undefined || b === undefined) return false;
      return isEqual(a, b);
    },
  });

  const getTrafficHistory = useCallback((period, year) => {
    return fetcher(`${HISTORY_API_ENDPOINT}?period=${period}&year=${year}`);
  }, []);

 

  const trackHomepageVisit = useCallback(async () => {
    try {
      const response = await axios.post(
        TRACK_API_ENDPOINT,
        {},
        { withCredentials: true }
      );
      return {
        success: response.status === 200 || response.status === 201,
        data: response.data,
        error: response.statusText,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
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
