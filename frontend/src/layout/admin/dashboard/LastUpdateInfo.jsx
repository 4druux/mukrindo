// frontend/src/layout/admin/dashboard/LastUpdateInfo.jsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useProducts } from "@/context/ProductContext";
import { useTraffic } from "@/context/TrafficContext";
import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from "date-fns";
import { FiRefreshCw } from "react-icons/fi";
import { Loader2 } from "lucide-react";

const LAST_UPDATE_TIME_KEY = "lastUpdateTime";
const PREVIOUS_DATA_KEY = "previousData";
const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB

const generateDataHash = (data, type) => {
  if (!data) return "no_data";

  if (type === "traffic") {
    if (data.totalUniqueVisitorsOverall !== undefined) {
      return [
        data.totalUniqueVisitorsOverall,
        data.uniqueVisitorsThisMonth,
        data.uniqueVisitorsLastMonth,
      ].join("|");
    }
    return "traffic_data_incomplete";
  }

  if (type === "products" && Array.isArray(data)) {
    if (data.length === 0) return "products_empty_array";
    return `${data.length}|${data.reduce((acc, p) => {
      const idPart = p._id || "no_id";
      const updatedAtPart = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
      const itemSignature = `${idPart}-${updatedAtPart}-${p.status || ""}-${
        p.viewCount || 0
      }`;

      let itemHash = 0;
      for (let i = 0; i < itemSignature.length; i++) {
        const char = itemSignature.charCodeAt(i);
        itemHash = (itemHash << 5) - itemHash + char;
        itemHash |= 0;
      }
      return acc ^ itemHash;
    }, 0)}`;
  }

  return `invalid_data_structure_for_${type}`;
};

const safeSetToLocalStorage = (key, value) => {
  try {
    const strValue = typeof value !== "string" ? JSON.stringify(value) : value;
    if (strValue.length > MAX_STORAGE_SIZE) {
      console.warn(`Data for key "${key}" is too large for localStorage.`);
      return false;
    }
    localStorage.setItem(key, strValue);
    return true;
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      console.warn("LocalStorage quota exceeded. Clearing some items.");
      localStorage.removeItem(key);
      localStorage.removeItem(PREVIOUS_DATA_KEY);
      try {
        localStorage.setItem(key, strValue);
        return true;
      } catch (retryError) {
        console.error(
          "Failed to save to localStorage even after clearing:",
          retryError
        );
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

  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [prevHash, setPrevHash] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedTime = localStorage.getItem(LAST_UPDATE_TIME_KEY);
    if (storedTime) {
      const parsedDate = new Date(storedTime);
      if (!isNaN(parsedDate.getTime())) {
        setLastUpdateTime(parsedDate);
      }
    }

    const storedHashes = localStorage.getItem(PREVIOUS_DATA_KEY);
    if (storedHashes) {
      try {
        const parsedHashes = JSON.parse(storedHashes);
        if (
          parsedHashes &&
          typeof parsedHashes.products === "string" &&
          typeof parsedHashes.traffic === "string"
        ) {
          setPrevHash(parsedHashes);
          return;
        }
      } catch (e) {
        console.warn("Could not parse previous hashes from localStorage", e);
      }
    }
    setPrevHash({
      products: "initial_hash_products_pending",
      traffic: "initial_hash_traffic_pending",
    });
  }, []);

  useEffect(() => {
    if (prevHash === null) {
      return;
    }

    if (productsLoading || statsLoading || productsError || statsError) {
      return;
    }

    if (!products || !trafficStats) {
      return;
    }

    const currentProductsHash = generateDataHash(products, "products");
    const currentTrafficHash = generateDataHash(trafficStats, "traffic");

    const hasProductChange = prevHash.products !== currentProductsHash;
    const hasTrafficChange = prevHash.traffic !== currentTrafficHash;
    const actualDataChanged = hasProductChange || hasTrafficChange;

    if (actualDataChanged) {
      if (
        prevHash.products !== "initial_hash_products_pending" ||
        prevHash.traffic !== "initial_hash_traffic_pending"
      ) {
        const now = new Date();
        setLastUpdateTime(now);
        safeSetToLocalStorage(LAST_UPDATE_TIME_KEY, now.toISOString());
      }

      const newHashes = {
        products: currentProductsHash,
        traffic: currentTrafficHash,
      };
      setPrevHash(newHashes);
      safeSetToLocalStorage(PREVIOUS_DATA_KEY, JSON.stringify(newHashes));
    }
  }, [
    products,
    trafficStats,
    productsLoading,
    statsLoading,
    productsError,
    statsError,
    prevHash,
  ]);

  const handleManualRefresh = useCallback(async () => {
    setIsUpdating(true);
    try {
      await Promise.all([mutateProducts(), mutateTrafficStats()]);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsUpdating(false);
    }
  }, [mutateProducts, mutateTrafficStats]);

  const formatTimeAgo = (date) => {
    if (!date) return "memuat...";
    const now = new Date();
    const minutes = differenceInMinutes(now, date);
    const hours = differenceInHours(now, date);
    const days = differenceInDays(now, date);

    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${days} hari lalu`;
  };

  const renderTimestamp = () => {
    if (
      prevHash === null ||
      ((productsLoading || statsLoading) && !lastUpdateTime)
    ) {
      return (
        <span className="flex items-center">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Memuat data...
        </span>
      );
    }

    if (productsError || statsError) {
      let errorMsg = [];
      if (productsError) errorMsg.push(productsError);
      if (statsError) errorMsg.push(statsError);
      return <span className="text-red-500 italic">Gagal memuat data</span>;
    }

    if (
      !lastUpdateTime &&
      !productsLoading &&
      !statsLoading &&
      !productsError &&
      !statsError
    ) {
      return <span className="font-semibold">Baru saja</span>;
    }

    return (
      <span className="font-semibold">
        {lastUpdateTime ? formatTimeAgo(lastUpdateTime) : "Menunggu data..."}
      </span>
    );
  };

  return (
    <div className="p-4 border border-gray-200 md:border-none md:rounded-2xl md:shadow-sm text-sm text-gray-600 bg-white flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        Data terakhir diupdate: {renderTimestamp()}
      </div>
      <button
        onClick={handleManualRefresh}
        disabled={isUpdating || productsLoading || statsLoading}
        className="p-2 text-orange-600 bg-orange-100 rounded-md hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        aria-label={isUpdating ? "Memperbarui data..." : "Perbarui data"}
      >
        <FiRefreshCw size={16} className={isUpdating ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
