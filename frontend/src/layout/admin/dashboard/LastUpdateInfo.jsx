"use client";
import React, { useState, useEffect, useRef } from "react";
import { useProducts } from "@/context/ProductContext";
import { useTraffic } from "@/context/TrafficContext";
import { formatDistanceToNow } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { FiRefreshCw } from "react-icons/fi";
import { Loader2 } from "lucide-react";

const LAST_UPDATE_TIME_KEY = "lastUpdateTime";
const PREVIOUS_DATA_KEY = "previousData";
const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB

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

// Safe storage handler
const safeLocalStorageSet = (key, value) => {
  try {
    if (value.length > MAX_STORAGE_SIZE) {
      console.warn(`Data too large for ${key}, truncating`);
      return false;
    }
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e.name === "QuotaExceededError") {
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
};

export default function LastUpdatedInfo() {
  const {
    products,
    loading: productsLoading,
    error: productsError,
    mutateProducts,
  } = useProducts();
  const { trafficStats, statsLoading, statsError, mutateTrafficStats } =
    useTraffic();
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasRealChange, setHasRealChange] = useState(false);

  const prevDataRef = useRef({ products: null, traffic: null });
  const isInitialLoadRef = useRef(true);

  // Load initial data from localStorage
  useEffect(() => {
    const storedTime = localStorage.getItem(LAST_UPDATE_TIME_KEY);
    const storedData = localStorage.getItem(PREVIOUS_DATA_KEY);

    if (storedTime) {
      const date = new Date(storedTime);
      if (!isNaN(date.getTime())) {
        setLastUpdateTime(date);
      } else {
        localStorage.removeItem(LAST_UPDATE_TIME_KEY);
      }
    }

    if (storedData) {
      try {
        prevDataRef.current = JSON.parse(storedData);
      } catch {
        localStorage.removeItem(PREVIOUS_DATA_KEY);
      }
    }

    isInitialLoadRef.current = true;
  }, []);

  // Check for data changes with optimized comparison
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
      safeLocalStorageSet(
        PREVIOUS_DATA_KEY,
        JSON.stringify(prevDataRef.current)
      );
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

      safeLocalStorageSet(LAST_UPDATE_TIME_KEY, newTime.toISOString());
      prevDataRef.current = {
        products: currentProductsHash,
        traffic: currentTrafficHash,
      };
      safeLocalStorageSet(
        PREVIOUS_DATA_KEY,
        JSON.stringify(prevDataRef.current)
      );
    } else {
      setHasRealChange(false);
    }
  }, [products, trafficStats, productsLoading, statsLoading]);

  const handleManualRefresh = async () => {
    setIsUpdating(true);
    try {
      await Promise.all([mutateProducts(), mutateTrafficStats()]);
    } catch (e) {
      console.error("Refresh failed:", e);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderTimestamp = () => {
    if (productsLoading || statsLoading) {
      return (
        <span className="flex items-center">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Memuat data...
        </span>
      );
    }
    if (productsError || statsError) {
      return <span className="text-red-500 italic">Gagal memuat data.</span>;
    }
    if (!lastUpdateTime) {
      return (
        <span className="flex items-center">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Memuat data...
        </span>
      );
    }

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
  };

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
