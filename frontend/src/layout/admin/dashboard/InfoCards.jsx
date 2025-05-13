// InfoCards.jsx
"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { MdGroup } from "react-icons/md";
import { IoIosTrendingUp, IoIosTrendingDown } from "react-icons/io";

import { useProducts } from "@/context/ProductContext";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  isWithinInterval,
  parseISO,
  isValid,
} from "date-fns";
import { CarInfoAvailable } from "@/components/product-admin/Dashboard/CarInfoAvailable";
import { CarInfoSold } from "@/components/product-admin/Dashboard/CarInfoSold";
import { WebsiteTraffic } from "@/components/product-admin/Dashboard/WebsiteTraffic";
import SkeletonInfoCard from "@/components/skeleton/skeleton-admin/SkeletonInfoCard";

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
    addedLastMonth: 0,
    addedTrend: { value: 0, direction: "neutral", show: false },
    totalSold: 0,
    soldThisMonth: 0,
    soldLastMonth: 0,
    soldTrend: { value: 0, direction: "neutral", show: false },
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
    if (
      productsLoading ||
      productsError ||
      !products ||
      products.length === 0
    ) {
      const defaultStats = {
        totalAvailable: overallTotalAvailable,
        totalSold: overallTotalSold,
        addedThisMonth: 0,
        addedLastMonth: 0,
        addedTrend: { value: 0, direction: "neutral", show: false },
        soldThisMonth: 0,
        soldLastMonth: 0,
        soldTrend: { value: 0, direction: "neutral", show: false },
      };
      if (productsError) {
        setDisplayStats(defaultStats);
      } else if (
        productsLoading ||
        (!products && !productsError) ||
        (products && products.length === 0 && !productsError)
      ) {
        setDisplayStats(defaultStats);
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
    let actualAddedLastMonth = 0;
    let actualSoldLastMonth = 0;

    products.forEach((p) => {
      const creationDate = getValidDate(p.createdAt);
      if (
        creationDate &&
        isWithinInterval(creationDate, {
          start: currentMonthStart,
          end: currentMonthEnd,
        })
      ) {
        actualAddedThisMonth++;
      }
      if (
        creationDate &&
        isWithinInterval(creationDate, {
          start: prevMonthStart,
          end: prevMonthEnd,
        })
      ) {
        actualAddedLastMonth++;
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

    const storedLastCalcMonthYear = localStorage.getItem(
      LAST_TREND_CALC_MONTH_YEAR_KEY
    );
    let showTrends = false;
    if (storedLastCalcMonthYear !== currentMonthYearStr) {
      localStorage.setItem(LAST_TREND_CALC_MONTH_YEAR_KEY, currentMonthYearStr);
      showTrends = true;
    } else if (storedLastCalcMonthYear) {
      showTrends = true;
    }

    const addedTrendVal = calculateTrendInternal(
      actualAddedThisMonth,
      actualAddedLastMonth
    );
    const soldTrendVal = calculateTrendInternal(
      actualSoldThisMonth,
      actualSoldLastMonth
    );

    setDisplayStats({
      totalAvailable: overallTotalAvailable,
      addedThisMonth: actualAddedThisMonth,
      addedLastMonth: actualAddedLastMonth,
      addedTrend: {
        value: Math.abs(addedTrendVal),
        direction:
          addedTrendVal > 0 ? "up" : addedTrendVal < 0 ? "down" : "neutral",
        show: showTrends,
      },
      totalSold: overallTotalSold,
      soldThisMonth: actualSoldThisMonth,
      soldLastMonth: actualSoldLastMonth,
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

  const renderTrend = (trendValue, direction) => {
    if (direction === "neutral" && trendValue === 0) {
      return (
        <span className="text-[11px] font-medium text-white bg-gray-500 px-1 rounded-full">
          0.00%
        </span>
      );
    }
    const isUp = direction === "up";
    return (
      <span
        className={`text-[11px] font-medium px-1 rounded-full ${
          isUp ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
        }`}
      >
        {trendValue.toFixed(2)}%
        {isUp ? (
          <IoIosTrendingUp className="inline ml-1 w-4 h-4 -rotate-12" />
        ) : (
          <IoIosTrendingDown className="inline ml-1 w-4 h-4 rotate-12" />
        )}
      </span>
    );
  };

  if (productsLoading && isInitialMountRef.current) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <SkeletonInfoCard key={i} />
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

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <CarInfoAvailable
        totalAvailable={displayStats.totalAvailable}
        addedThisMonth={displayStats.addedThisMonth}
        addedLastMonth={displayStats.addedLastMonth}
        addedTrend={displayStats.addedTrend}
        renderTrend={renderTrend}
      />

      <CarInfoSold
        totalSold={displayStats.totalSold}
        soldThisMonth={displayStats.soldThisMonth}
        soldLastMonth={displayStats.soldLastMonth}
        soldTrend={displayStats.soldTrend}
        renderTrend={renderTrend}
      />

      <WebsiteTraffic renderTrend={renderTrend} />

      <div className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5">
        <h2 className="text-md text-gray-700 font-medium">Pendaftar Akun</h2>
        <div className="flex items-start justify-start gap-2 mt-2">
          <div className="flex items-center justify-center w-14 h-10 bg-blue-100 text-blue-600 rounded-lg mb-3">
            <MdGroup className="w-5 h-5" />
          </div>
          <p className="text-xl font-semibold text-blue-600 mt-2 text-center">
            3,782
          </p>
        </div>
        <div className="text-xs text-gray-600">
          Bulan Ini: <span className="font-semibold">150</span>
          <span className="ml-1 text-green-600">
            <IoIosTrendingUp className="inline w-4 h-4" />
            10.5%
          </span>
        </div>
      </div>
    </div>
  );
};
