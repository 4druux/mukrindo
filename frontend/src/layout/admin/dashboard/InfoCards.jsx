// frontend/src/components/product-admin/Dashboard/InfoCards.jsx
"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { IoIosTrendingUp, IoIosTrendingDown } from "react-icons/io";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  isWithinInterval,
  parseISO,
  isValid,
} from "date-fns";
import { motion } from "framer-motion";

// Contexts
import { useProducts } from "@/context/ProductContext";
import { useAuth } from "@/context/AuthContext";

// Components
import { CarInfoAvailable } from "@/components/product-admin/Dashboard/CarInfoAvailable";
import { CarInfoSold } from "@/components/product-admin/Dashboard/CarInfoSold";
import { WebsiteTraffic } from "@/components/product-admin/Dashboard/WebsiteTraffic";
import { AccountRegistrantsInfo } from "@/components/product-admin/Dashboard/AccountRegistrantsInfo";
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
  // Data dari contexts
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();
  const { allUsers, usersLoading, usersError } = useAuth();

  const isInitialMountRef = useRef(true);

  // State untuk statistik produk
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

  // State untuk statistik pengguna
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    registeredThisMonth: 0,
    registeredLastMonth: 0,
    registrationTrend: { value: 0, direction: "neutral", show: false },
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
    const isLoading = productsLoading || usersLoading;
    const hasError = productsError || usersError;

    if (isLoading || hasError) return;

    // Persiapan tanggal
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const prevMonthDate = subMonths(now, 1);
    const prevMonthStart = startOfMonth(prevMonthDate);
    const prevMonthEnd = endOfMonth(prevMonthDate);

    // Kalkulasi Produk
    let actualAddedThisMonth = 0,
      actualSoldThisMonth = 0;
    let actualAddedLastMonth = 0,
      actualSoldLastMonth = 0;

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

    // Kalkulasi Pengguna
    let actualRegisteredThisMonth = 0,
      actualRegisteredLastMonth = 0;
    allUsers.forEach((user) => {
      const registrationDate = getValidDate(user.createdAt);
      if (
        registrationDate &&
        isWithinInterval(registrationDate, {
          start: currentMonthStart,
          end: currentMonthEnd,
        })
      ) {
        actualRegisteredThisMonth++;
      }
      if (
        registrationDate &&
        isWithinInterval(registrationDate, {
          start: prevMonthStart,
          end: prevMonthEnd,
        })
      ) {
        actualRegisteredLastMonth++;
      }
    });

    // Logika menampilkan tren
    const currentMonthYearStr = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    const storedLastCalcMonthYear = localStorage.getItem(
      LAST_TREND_CALC_MONTH_YEAR_KEY
    );
    let showTrends = storedLastCalcMonthYear ? true : false;
    if (storedLastCalcMonthYear !== currentMonthYearStr) {
      localStorage.setItem(LAST_TREND_CALC_MONTH_YEAR_KEY, currentMonthYearStr);
      showTrends = true;
    }

    // Kalkulasi Tren
    const addedTrendVal = calculateTrendInternal(
      actualAddedThisMonth,
      actualAddedLastMonth
    );
    const soldTrendVal = calculateTrendInternal(
      actualSoldThisMonth,
      actualSoldLastMonth
    );
    const registrationTrendVal = calculateTrendInternal(
      actualRegisteredThisMonth,
      actualRegisteredLastMonth
    );

    // Set State
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
    setUserStats({
      totalUsers: allUsers.length,
      registeredThisMonth: actualRegisteredThisMonth,
      registeredLastMonth: actualRegisteredLastMonth,
      registrationTrend: {
        value: Math.abs(registrationTrendVal),
        direction:
          registrationTrendVal > 0
            ? "up"
            : registrationTrendVal < 0
            ? "down"
            : "neutral",
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
    allUsers,
    usersLoading,
    usersError,
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
          <IoIosTrendingUp className="inline ml-1 w-4 h-4" />
        ) : (
          <IoIosTrendingDown className="inline ml-1 w-4 h-4" />
        )}
      </span>
    );
  };

  if ((productsLoading || usersLoading) && isInitialMountRef.current) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <SkeletonInfoCard key={i} />
        ))}
      </div>
    );
  }

  if (productsError || usersError) {
    return (
      <div className="text-red-500 p-4">
        Gagal memuat data statistik. Error: {productsError || usersError}
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 14,
      },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 md:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        whileHover={{
          scale: 1.03,
          y: -5,
          transition: { type: "spring", stiffness: 300 },
        }}
      >
        <CarInfoAvailable
          totalAvailable={displayStats.totalAvailable}
          addedThisMonth={displayStats.addedThisMonth}
          addedLastMonth={displayStats.addedLastMonth}
          addedTrend={displayStats.addedTrend}
          renderTrend={renderTrend}
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        whileHover={{
          scale: 1.03,
          y: -5,
          transition: { type: "spring", stiffness: 300 },
        }}
      >
        <CarInfoSold
          totalSold={displayStats.totalSold}
          soldThisMonth={displayStats.soldThisMonth}
          soldLastMonth={displayStats.soldLastMonth}
          soldTrend={displayStats.soldTrend}
          renderTrend={renderTrend}
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        whileHover={{
          scale: 1.03,
          y: -5,
          transition: { type: "spring", stiffness: 300 },
        }}
      >
        <WebsiteTraffic renderTrend={renderTrend} />
      </motion.div>

      <motion.div
        variants={itemVariants}
        whileHover={{
          scale: 1.03,
          y: -5,
          transition: { type: "spring", stiffness: 300 },
        }}
      >
        <AccountRegistrantsInfo
          totalUsers={userStats.totalUsers}
          registeredThisMonth={userStats.registeredThisMonth}
          registeredLastMonth={userStats.registeredLastMonth}
          registrationTrend={userStats.registrationTrend}
          renderTrend={renderTrend}
        />
      </motion.div>
    </motion.div>
  );
};
