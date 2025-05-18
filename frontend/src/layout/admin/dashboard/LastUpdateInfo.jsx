"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useProducts } from "@/context/ProductContext";
import { useTraffic } from "@/context/TrafficContext";
import { formatDistanceToNow } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { FiRefreshCw } from "react-icons/fi";
import { Loader2 } from "lucide-react";

// Constants
const LAST_UPDATE_TIME_KEY = "lastUpdateTime";
const PREVIOUS_DATA_KEY = "previousData";
const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB

// Custom hook for safe localStorage access
const useLocalStorage = () => {
  const isClient = typeof window !== "undefined";

  const getItem = useCallback(
    (key) => {
      if (!isClient) return null;
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error("LocalStorage access error:", error);
        return null;
      }
    },
    [isClient]
  );

  const setItem = useCallback(
    (key, value) => {
      if (!isClient) return false;

      try {
        if (value.length > MAX_STORAGE_SIZE) {
          console.warn(`Data too large for ${key}, truncating`);
          return false;
        }
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        if (error.name === "QuotaExceededError") {
          console.warn("Storage quota exceeded, clearing some space");
          localStorage.removeItem(key);
          localStorage.removeItem(PREVIOUS_DATA_KEY);
          try {
            localStorage.setItem(key, value);
            return true;
          } catch (e) {
            console.error("Failed to store after cleanup", e);
            return false;
          }
        }
        return false;
      }
    },
    [isClient]
  );

  return { getItem, setItem };
};

// Data hashing function
const generateDataHash = (data) => {
  if (!data) return null;

  if (data.totalVisits !== undefined) {
    return `${data.totalVisits}|${data.uniqueVisitors}|${data.todayVisits}|${
      data.currentMonthVisits
    }|${data.lastUpdated ? new Date(data.lastUpdated).getTime() : 0}`;
  }

  if (Array.isArray(data)) {
    return `${data.length}|${data.reduce((acc, p) => acc ^ p.id, 0)}`;
  }

  return null;
};

export default function LastUpdatedInfo() {
  // Context hooks
  const {
    products,
    loading: productsLoading,
    error: productsError,
    mutateProducts,
  } = useProducts();

  const {
    trafficStats,
    loading: statsLoading,
    error: statsError,
    mutateTrafficStats,
  } = useTraffic();

  // Local storage hook
  const { getItem, setItem } = useLocalStorage();

  // State management
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasRealChange, setHasRealChange] = useState(false);

  // Refs
  const prevDataRef = useRef({ products: null, traffic: null });
  const isInitialLoadRef = useRef(true);

  // Load initial data
  useEffect(() => {
    const storedTime = getItem(LAST_UPDATE_TIME_KEY);
    const storedData = getItem(PREVIOUS_DATA_KEY);

    if (storedTime) {
      const date = new Date(storedTime);
      if (!isNaN(date.getTime())) {
        setLastUpdateTime(date);
      } else {
        setItem(LAST_UPDATE_TIME_KEY, "");
      }
    }

    if (storedData) {
      try {
        prevDataRef.current = JSON.parse(storedData);
      } catch {
        setItem(PREVIOUS_DATA_KEY, "");
      }
    }

    isInitialLoadRef.current = true;
  }, [getItem, setItem]);

  // Check for data changes
  useEffect(() => {
    if (productsLoading || statsLoading) return;

    const currentProductsHash = generateDataHash(products);
    const currentTrafficHash = generateDataHash(trafficStats);

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      prevDataRef.current = {
        products: currentProductsHash,
        traffic: currentTrafficHash,
      };
      setItem(PREVIOUS_DATA_KEY, JSON.stringify(prevDataRef.current));
      return;
    }

    const hasProductChange =
      prevDataRef.current.products !== currentProductsHash;
    const hasTrafficChange = prevDataRef.current.traffic !== currentTrafficHash;
    const hasChange = hasProductChange || hasTrafficChange;

    if (hasChange) {
      const newTime = new Date();
      setLastUpdateTime(newTime);
      setHasRealChange(true);

      setItem(LAST_UPDATE_TIME_KEY, newTime.toISOString());
      prevDataRef.current = {
        products: currentProductsHash,
        traffic: currentTrafficHash,
      };
      setItem(PREVIOUS_DATA_KEY, JSON.stringify(prevDataRef.current));
    } else {
      setHasRealChange(false);
    }
  }, [products, trafficStats, productsLoading, statsLoading, setItem]);

  // Manual refresh handler
  const handleManualRefresh = useCallback(async () => {
    setIsUpdating(true);
    try {
      await Promise.all([mutateProducts(), mutateTrafficStats()]);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [mutateProducts, mutateTrafficStats]);

  // Render timestamp logic
  const renderTimestamp = useCallback(() => {
    if (productsError || statsError) {
      return <span className="text-red-500 italic">Gagal memuat data.</span>;
    }

    if (!products && !trafficStats) {
      return (
        <span className="flex items-center">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Memuat data...
        </span>
      );
    }

    if (!lastUpdateTime) return null;

    if (hasRealChange) {
      return <span className="font-semibold">baru saja</span>;
    }

    return (
      <span className="font-semibold">
        {formatDistanceToNow(lastUpdateTime, {
          addSuffix: true,
          locale: localeID,
        })}
      </span>
    );
  }, [
    products,
    trafficStats,
    productsError,
    statsError,
    lastUpdateTime,
    hasRealChange,
  ]);

  return (
    <div className="p-4 border border-gray-200 md:border-none md:rounded-2xl md:shadow-sm text-sm text-gray-600 bg-white flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        Terakhir data diperbarui: {renderTimestamp()}
      </div>
      <button
        onClick={handleManualRefresh}
        disabled={isUpdating || productsLoading || statsLoading}
        className="p-2 text-orange-600 bg-orange-100 rounded-md hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        aria-label={isUpdating ? "Sedang menyegarkan data" : "Segarkan data"}
      >
        <FiRefreshCw size={16} className={isUpdating ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
