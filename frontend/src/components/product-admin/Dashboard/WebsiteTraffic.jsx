// frontend/src/components/product-admin/Dashboard/WebsiteTraffic.jsx
"use client";
import React from "react";
import {
  MdGroup,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { useTraffic } from "@/context/TrafficContext";

// ... (fungsi calculateTrendInternal dan renderTrend tetap sama atau diimpor)
const calculateTrendInternal = (current, previous) => {
  if (previous === null || isNaN(previous) || typeof previous === "undefined")
    return current > 0 ? 100 : 0;
  if (previous === 0) return current > 0 ? 100 : 0;
  if (current === previous) return 0;
  return ((current - previous) / previous) * 100;
};

const renderTrend = (
  trendValue,
  direction,
  TrendIconUp = MdKeyboardArrowUp,
  TrendIconDown = MdKeyboardArrowDown
) => {
  if (direction === "neutral" && trendValue === 0) {
    return <span className="text-xs font-medium text-gray-500">(0.00%)</span>;
  }
  const isUp = direction === "up";
  return (
    <span
      className={`text-xs font-medium ${
        isUp ? "text-green-600" : "text-red-600"
      }`}
    >
      {isUp ? (
        <TrendIconUp className="inline w-4 h-4" />
      ) : (
        <TrendIconDown className="inline w-4 h-4" />
      )}
      {trendValue.toFixed(2)}%
    </span>
  );
};

export const WebsiteTraffic = () => {
  const { trafficStats, statsLoading, statsError } = useTraffic();

  if (statsLoading) {
    return (
      <div className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6">
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-4 animate-pulse"></div>
        <div className="flex items-start justify-start gap-2 mt-2 mb-4">
          <div className="w-14 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
          <div className="h-6 bg-gray-300 rounded w-1/4 mt-1 animate-pulse"></div>
        </div>
        <div className="h-3 bg-gray-300 rounded w-3/4 animate-pulse"></div>
      </div>
    );
  }

  if (statsError) {
    // ... (penanganan error tetap sama)
    return (
      <div className="bg-white border border-red-300 md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6 text-red-600">
        <h2 className="text-md text-gray-700 font-medium">Trafik Website</h2>
        <div className="flex items-start justify-start gap-2 mt-2">
          <div className="flex items-center justify-center w-14 h-10 bg-red-100 rounded-lg mb-3">
            <MdGroup className="w-5 h-5" />
          </div>
          <div className="mt-1">
            <p className="text-sm font-semibold">Error:</p>
            <p className="text-xs">
              {statsError.message || "Gagal memuat data kunjungan."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!trafficStats) {
    // ... (penanganan jika tidak ada trafficStats tetap sama)
    return (
      <div className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6">
        <h2 className="text-md text-gray-700 font-medium">Trafik Website</h2>
        <p className="text-xs text-gray-500 mt-2">
          Data trafik tidak tersedia.
        </p>
      </div>
    );
  }

  const trendVal = calculateTrendInternal(
    trafficStats.uniqueVisitorsThisMonth,
    trafficStats.uniqueVisitorsLastMonth 
  );

  const trend = {
    value: Math.abs(trendVal),
    direction: trendVal > 0 ? "up" : trendVal < 0 ? "down" : "neutral",
    show: true,
  };

  return (
    <div className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6">
      <h2 className="text-md text-gray-700 font-medium">Trafik Website</h2>
      <div className="flex items-start justify-start gap-2 mt-2">
        <div className="flex items-center justify-center w-14 h-10 bg-blue-100 text-blue-600 rounded-lg mb-3">
          <MdGroup className="w-5 h-5" />
        </div>
        <p className="text-xl font-medium text-gray-700 mt-2 text-center">
          {trafficStats.totalUniqueVisitorsOverall?.toLocaleString("id-ID") ||
            0}
        </p>
      </div>
      <div className="text-xs text-gray-600 space-y-1">
        <div>
          Trafik Bulan Lalu:{" "}
          <span className="font-semibold">
            {trafficStats.uniqueVisitorsLastMonth?.toLocaleString("id-ID") || 0}
          </span>
        </div>
        <div>
          Trafik Bulan Ini:{" "}
          <span className="font-semibold">
            {trafficStats.uniqueVisitorsThisMonth?.toLocaleString("id-ID") || 0}
          </span>
          {trend.show && (
            <span className="ml-1">
              {renderTrend(trend.value, trend.direction)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
