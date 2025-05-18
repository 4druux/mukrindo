"use client";
import React, { useState, useEffect } from "react";
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
  if (!data) return "no_data";

  if (data.totalVisits !== undefined) {
    return [
      data.totalVisits,
      data.uniqueVisitors,
      data.todayVisits,
      data.currentMonthVisits,
      data.lastUpdated ? new Date(data.lastUpdated).getTime() : 0,
    ].join("|");
  }

  if (Array.isArray(data)) {
    return `${data.length}|${data.reduce((acc, p) => acc ^ p.id, 0)}`;
  }

  return "invalid_data";
};

const safeSetToLocalStorage = (key, value) => {
  try {
    if (typeof value !== "string") {
      value = JSON.stringify(value);
    }

    if (value.length > MAX_STORAGE_SIZE) {
      console.warn(`Data too large for localStorage (${key})`);
      return false;
    }

    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      console.warn("LocalStorage quota exceeded, clearing old data");
      localStorage.removeItem(key);
      localStorage.removeItem(PREVIOUS_DATA_KEY);
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (err) {
        console.error("Failed to save to localStorage:", err);
        return false;
      }
    }
    console.error("LocalStorage error:", e);
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

  const [lastUpdateTime, setLastUpdateTime] = (useState < Date) | (null > null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasRealChange, setHasRealChange] = useState(false);
  const [prevHash, setPrevHash] = useState({
    products: "no_data",
    traffic: "no_data",
  });

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize or recover lastUpdateTime
    const storedTime = localStorage.getItem(LAST_UPDATE_TIME_KEY);
    if (storedTime) {
      const parsed = new Date(storedTime);
      if (!isNaN(parsed.getTime())) {
        setLastUpdateTime(parsed);
      } else {
        // Handle invalid date
        const now = new Date();
        setLastUpdateTime(now);
        safeSetToLocalStorage(LAST_UPDATE_TIME_KEY, now.toISOString());
      }
    } else {
      // First time load - set initial time
      const now = new Date();
      setLastUpdateTime(now);
      safeSetToLocalStorage(LAST_UPDATE_TIME_KEY, now.toISOString());
    }

    // Initialize previous data hash
    const storedData = localStorage.getItem(PREVIOUS_DATA_KEY);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setPrevHash({
          products: parsed.products || "no_data",
          traffic: parsed.traffic || "no_data",
        });
      } catch {
        localStorage.removeItem(PREVIOUS_DATA_KEY);
      }
    }
  }, []);

  // Detect data changes
  useEffect(() => {
    if (productsLoading || statsLoading) return;

    const currentProductsHash = generateDataHash(products);
    const currentTrafficHash = generateDataHash(trafficStats);

    const hasProductChange = prevHash.products !== currentProductsHash;
    const hasTrafficChange = prevHash.traffic !== currentTrafficHash;
    const hasChange = hasProductChange || hasTrafficChange;

    if (hasChange) {
      const now = new Date();
      setLastUpdateTime(now);
      setHasRealChange(true);
      safeSetToLocalStorage(LAST_UPDATE_TIME_KEY, now.toISOString());
    } else {
      setHasRealChange(false);
    }

    const newHash = {
      products: currentProductsHash,
      traffic: currentTrafficHash,
    };

    setPrevHash(newHash);
    safeSetToLocalStorage(PREVIOUS_DATA_KEY, JSON.stringify(newHash));
  }, [products, trafficStats, productsLoading, statsLoading]);

  const handleManualRefresh = async () => {
    setIsUpdating(true);
    try {
      await Promise.all([mutateProducts(), mutateTrafficStats()]);
      const now = new Date();
      setLastUpdateTime(now);
      safeSetToLocalStorage(LAST_UPDATE_TIME_KEY, now.toISOString());
    } catch (err) {
      console.error("Refresh failed:", err);
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
      return (
        <span className="text-red-500 italic">
          Gagal memuat data: {productsError?.message || statsError?.message}
        </span>
      );
    }

    if (!lastUpdateTime) {
      return <span className="text-gray-500">Menunggu inisialisasi...</span>;
    }

    if (hasRealChange) {
      return <span className="font-semibold">Baru saja diperbarui</span>;
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
        Terakhir diperbarui: {renderTimestamp()}
      </div>
      <button
        onClick={handleManualRefresh}
        disabled={isUpdating || productsLoading || statsLoading}
        className="p-2 text-orange-600 bg-orange-100 rounded-md hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        aria-label={isUpdating ? "memperbarui data..." : "perbarui data"}
      >
        <FiRefreshCw size={16} className={isUpdating ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
