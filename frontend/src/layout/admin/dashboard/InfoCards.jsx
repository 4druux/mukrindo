"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdGroup,
} from "react-icons/md";
import { FaBoxOpen, FaCar } from "react-icons/fa";
import { useProducts } from "@/context/ProductContext";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  isWithinInterval,
  parseISO,
  isValid,
} from "date-fns";

const PREV_MONTH_ADDED_COUNT_KEY = "infoCardsPrevMonthAdded";
const PREV_MONTH_SOLD_COUNT_KEY = "infoCardsPrevMonthSold";
const LAST_TREND_CALC_MONTH_YEAR_KEY = "infoCardsLastTrendCalcMonthYear";

const calculateTrendInternal = (current, previous) => {
  if (previous === null || isNaN(previous) || typeof previous === "undefined")
    return current > 0 ? 100 : 0;
  if (previous === 0) return current > 0 ? 100 : 0;
  if (current === previous) return 0;
  return ((current - previous) / previous) * 100;
};

const getValidDate = (dateString) => {
  if (!dateString) return null;
  try {
    const date = parseISO(dateString);
    if (isValid(date)) return date;
    const fallbackDate = new Date(dateString);
    return isValid(fallbackDate) ? fallbackDate : null;
  } catch (e) {
    return null;
  }
};

export const InfoCards = () => {
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();
  const isInitialMountRef = useRef(true);

  const [displayStats, setDisplayStats] = useState({
    totalAvailable: 0,
    addedThisMonth: 0,
    addedTrend: { value: 0, direction: "neutral", show: false },
    totalSold: 0,
    soldThisMonth: 0,
    soldTrend: { value: 0, direction: "neutral", show: false },
  });

  const [websiteVisits, setWebsiteVisits] = useState({
    totalOverall: 0,
    thisMonth: 0,
    trend: { value: 0, direction: "neutral", show: false },
    loading: true,
    error: null,
  });

  const { overallTotalAvailable, overallTotalSold } = useMemo(() => {
    if (!products || products.length === 0) {
      return { overallTotalAvailable: 0, overallTotalSold: 0 };
    }
    const available = products.filter(
      (p) => p.status?.toLowerCase() === "tersedia"
    ).length;
    const sold = products.filter(
      (p) => p.status?.toLowerCase() === "terjual"
    ).length;
    return { overallTotalAvailable: available, overallTotalSold: sold };
  }, [products]);

  useEffect(() => {
    if (productsLoading || productsError || !products) {
      if (productsError) {
        setDisplayStats({
          totalAvailable: 0,
          addedThisMonth: 0,
          addedTrend: { value: 0, direction: "neutral", show: false },
          totalSold: 0,
          soldThisMonth: 0,
          soldTrend: { value: 0, direction: "neutral", show: false },
        });
      }
      return;
    }

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const currentMonthYearStr = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    const prevMonthDate = subMonths(now, 1);
    const prevMonthStart = startOfMonth(prevMonthDate);
    const prevMonthEnd = endOfMonth(prevMonthDate);

    let actualAddedThisMonth = 0;
    let actualSoldThisMonth = 0;

    products.forEach((p) => {
      if (p.status?.toLowerCase() === "tersedia") {
        const availableDate = getValidDate(p.createdAt);
        if (
          availableDate &&
          isWithinInterval(availableDate, {
            start: currentMonthStart,
            end: currentMonthEnd,
          })
        ) {
          actualAddedThisMonth++;
        }
      }
      if (p.status?.toLowerCase() === "terjual") {
        const saleDate = getValidDate(p.soldDate || p.updatedAt);
        if (
          saleDate &&
          isWithinInterval(saleDate, {
            start: currentMonthStart,
            end: currentMonthEnd,
          })
        ) {
          actualSoldThisMonth++;
        }
      }
    });

    const storedLastCalcMonthYear = localStorage.getItem(
      LAST_TREND_CALC_MONTH_YEAR_KEY
    );
    let prevMonthAddedCount = parseInt(
      localStorage.getItem(PREV_MONTH_ADDED_COUNT_KEY) || "0",
      10
    );
    let prevMonthSoldCount = parseInt(
      localStorage.getItem(PREV_MONTH_SOLD_COUNT_KEY) || "0",
      10
    );
    let showTrends = false;

    if (storedLastCalcMonthYear !== currentMonthYearStr) {
      let actualAddedLastMonth = 0;
      let actualSoldLastMonth = 0;
      products.forEach((p) => {
        if (p.status?.toLowerCase() === "tersedia") {
          const availableDate = getValidDate(p.createdAt);
          if (
            availableDate &&
            isWithinInterval(availableDate, {
              start: prevMonthStart,
              end: prevMonthEnd,
            })
          ) {
            actualAddedLastMonth++;
          }
        }
        if (p.status?.toLowerCase() === "terjual") {
          const saleDate = getValidDate(p.soldDate || p.updatedAt);
          if (
            saleDate &&
            isWithinInterval(saleDate, {
              start: prevMonthStart,
              end: prevMonthEnd,
            })
          ) {
            actualSoldLastMonth++;
          }
        }
      });
      localStorage.setItem(
        PREV_MONTH_ADDED_COUNT_KEY,
        actualAddedLastMonth.toString()
      );
      localStorage.setItem(
        PREV_MONTH_SOLD_COUNT_KEY,
        actualSoldLastMonth.toString()
      );
      localStorage.setItem(LAST_TREND_CALC_MONTH_YEAR_KEY, currentMonthYearStr);
      prevMonthAddedCount = actualAddedLastMonth;
      prevMonthSoldCount = actualSoldLastMonth;
      showTrends = true;
    } else if (storedLastCalcMonthYear) {
      showTrends = true;
    }

    const addedTrendVal = calculateTrendInternal(
      actualAddedThisMonth,
      prevMonthAddedCount
    );
    const soldTrendVal = calculateTrendInternal(
      actualSoldThisMonth,
      prevMonthSoldCount
    );

    setDisplayStats({
      totalAvailable: overallTotalAvailable,
      addedThisMonth: actualAddedThisMonth,
      addedTrend: {
        value: Math.abs(addedTrendVal),
        direction:
          addedTrendVal > 0 ? "up" : addedTrendVal < 0 ? "down" : "neutral",
        show: showTrends,
      },
      totalSold: overallTotalSold,
      soldThisMonth: actualSoldThisMonth,
      soldTrend: {
        value: Math.abs(soldTrendVal),
        direction:
          soldTrendVal > 0 ? "up" : soldTrendVal < 0 ? "down" : "neutral",
        show: showTrends,
      },
    });

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
    }
  }, [
    products,
    productsLoading,
    productsError,
    overallTotalAvailable,
    overallTotalSold,
  ]);

  useEffect(() => {
    const fetchWebsiteVisitStats = async () => {
      setWebsiteVisits((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await fetch(
          "http://localhost:5000/api/visits/homepage/stats",
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error(
            `Gagal mengambil data statistik kunjungan: ${response.statusText}`
          );
        }
        const data = await response.json();

        const trendVal = calculateTrendInternal(
          data.uniqueVisitorsThisMonth,
          data.uniqueVisitorsLastMonth
        );

        setWebsiteVisits({
          totalOverall: data.totalUniqueVisitorsOverall,
          thisMonth: data.uniqueVisitorsThisMonth,
          trend: {
            value: Math.abs(trendVal),
            direction: trendVal > 0 ? "up" : trendVal < 0 ? "down" : "neutral",
            show: true,
          },
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error("Error fetching website visit stats:", err);
        setWebsiteVisits((prev) => ({
          ...prev,
          loading: false,
          error: err.message || "Gagal memuat data kunjungan.",
        }));
      }
    };

    fetchWebsiteVisitStats();
    const intervalId = setInterval(fetchWebsiteVisitStats, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const renderTrend = (trendValue, direction) => {
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
          <MdKeyboardArrowUp className="inline w-4 h-4" />
        ) : (
          <MdKeyboardArrowDown className="inline w-4 h-4" />
        )}
        {trendValue.toFixed(2)}%
      </span>
    );
  };

  if (productsLoading && isInitialMountRef.current) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white border md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6 animate-pulse"
          >
            <div className="w-10 h-10 bg-gray-200 rounded-lg mb-3"></div>
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (productsError)
    return (
      <div className="text-red-500 p-4">
        Gagal memuat data statistik produk.
      </div>
    );

  const WebsiteVisitCardSkeleton = () => (
    <div className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6 animate-pulse">
      <div className="w-10 h-10 bg-gray-200 rounded-lg mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6">
      <div className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6">
        <div className="flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-600 rounded-lg mb-3">
          <FaCar className="w-5 h-5" />
        </div>
        <h2 className="text-sm text-gray-500">Total Mobil Tersedia</h2>
        <p className="text-2xl font-semibold text-gray-800 mt-1">
          {displayStats.totalAvailable.toLocaleString("id-ID")}
        </p>
        <div className="mt-2 text-xs text-gray-600">
          Penambahan Bulan Ini:{" "}
          <span className="font-semibold">
            {displayStats.addedThisMonth.toLocaleString("id-ID")}
          </span>
          {displayStats.addedTrend.show && (
            <span className="ml-1">
              {renderTrend(
                displayStats.addedTrend.value,
                displayStats.addedTrend.direction
              )}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6">
        <div className="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-lg mb-3">
          <FaBoxOpen className="w-5 h-5" />
        </div>
        <h2 className="text-sm text-gray-500">Total Mobil Terjual</h2>
        <p className="text-2xl font-semibold text-gray-800 mt-1">
          {displayStats.totalSold.toLocaleString("id-ID")}
        </p>
        <div className="mt-2 text-xs text-gray-600">
          Terjual Bulan Ini:{" "}
          <span className="font-semibold">
            {displayStats.soldThisMonth.toLocaleString("id-ID")}
          </span>
          {displayStats.soldTrend.show && (
            <span className="ml-1">
              {renderTrend(
                displayStats.soldTrend.value,
                displayStats.soldTrend.direction
              )}
            </span>
          )}
        </div>
      </div>

      {websiteVisits.loading ? (
        <WebsiteVisitCardSkeleton />
      ) : websiteVisits.error ? (
        <div className="bg-white border border-red-300 md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6 text-red-600">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg mb-3">
            <MdGroup className="w-5 h-5" />
          </div>
          <h2 className="text-sm text-gray-500">Total Kunjungan Website</h2>
          <p className="text-sm font-semibold mt-1">Error:</p>
          <p className="text-xs mt-1">{websiteVisits.error}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-lg mb-3">
            <MdGroup className="w-5 h-5" />
          </div>
          <h2 className="text-sm text-gray-500">Total Kunjungan Website</h2>
          <p className="text-2xl font-semibold text-gray-800 mt-1">
            {websiteVisits.totalOverall.toLocaleString("id-ID")}
          </p>
          <div className="mt-2 text-xs text-gray-600">
            Bulan Ini:{" "}
            <span className="font-semibold">
              {websiteVisits.thisMonth.toLocaleString("id-ID")}
            </span>
            {websiteVisits.trend.show && (
              <span className="ml-1">
                {renderTrend(
                  websiteVisits.trend.value,
                  websiteVisits.trend.direction
                )}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-lg mb-3">
          <MdGroup className="w-5 h-5" />
        </div>
        <h2 className="text-sm text-gray-500">Pendaftar Akun</h2>
        <p className="text-2xl font-semibold text-gray-800 mt-1">3,782</p>
        <div className="mt-2 text-xs text-gray-600">
          Bulan Ini: <span className="font-semibold">150</span>
          <span className="ml-1 text-green-600">
            <MdKeyboardArrowUp className="inline w-4 h-4" />
            10.5%
          </span>
        </div>
      </div>
    </div>
  );
};
