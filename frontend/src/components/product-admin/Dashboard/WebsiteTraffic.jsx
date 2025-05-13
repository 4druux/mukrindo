// frontend/src/components/product-admin/Dashboard/WebsiteTraffic.jsx
"use client";
import React from "react";
import { FaChartBar } from "react-icons/fa";
import { useTraffic } from "@/context/TrafficContext";

const calculateTrendInternal = (current, previous) => {
  if (previous === null || isNaN(previous) || typeof previous === "undefined")
    return current > 0 ? 100 : 0;
  if (previous === 0) return current > 0 ? 100 : 0;
  if (current === previous) return 0;
  return ((current - previous) / previous) * 100;
};

export const WebsiteTraffic = ({ renderTrend }) => {
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
    return (
      <div className="bg-white border border-red-300 md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6 text-red-600">
        <h2 className="text-md text-gray-700 font-medium">Trafik Website</h2>
        <div className="flex items-start justify-start gap-2 mt-2">
          <div className="flex items-center justify-center w-14 h-10 bg-red-100 rounded-lg mb-3">
            <FaChartBar className="w-5 h-5" />
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
    <div className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5">
      <h2 className="text-md text-gray-700 font-medium">Trafik Website</h2>
      <div className="flex items-start justify-start gap-2 mt-2">
        <div className="flex items-center justify-center w-14 h-10 bg-teal-100 text-teal-600 rounded-lg mb-3">
          <FaChartBar className="w-5 h-5" />
        </div>
        <p className="text-xl font-semibold text-teal-600 mt-2 text-center">
          {trafficStats.totalUniqueVisitorsOverall?.toLocaleString("id-ID") ||
            0}
        </p>
      </div>
      <div className="text-xs text-gray-600 space-y-1">
        <h2>Trafik Website Bulanan:</h2>
        <div>
          Bulan Lalu:{" "}
          <span className="font-semibold">
            {trafficStats.uniqueVisitorsLastMonth?.toLocaleString("id-ID") || 0}
          </span>
        </div>
        <div>
          Bulan Ini:{" "}
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
