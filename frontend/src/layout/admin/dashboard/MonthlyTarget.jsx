// src/components/admin/dashboard/MonthlyTarget.jsx
"use client";
import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { useProducts } from "@/context/ProductContext";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  getYear,
  getMonth,
  isValid,
  parseISO,
  format as formatDate,
} from "date-fns";
import { id as localeID } from "date-fns/locale";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const getValidSaleDate = (product) => {
  const dateStr = product.soldDate || product.updatedAt;
  if (!dateStr) return null;
  try {
    let dateObj = parseISO(dateStr);
    if (isValid(dateObj)) return dateObj;
    dateObj = new Date(dateStr);
    return isValid(dateObj) ? dateObj : null;
  } catch (error) {
    return null;
  }
};

const formatCurrency = (value, currency = "IDR") => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const STATIC_MONTHLY_TARGET = 5000000000; // Target Statis Rp 500 Juta

export default function MonthlyTarget() {
  const { products, loading, error } = useProducts();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (
        now.getMonth() !== currentDate.getMonth() ||
        now.getFullYear() !== currentDate.getFullYear()
      ) {
        setCurrentDate(now);
      }
    }, 3600000); // Cek setiap jam untuk perubahan bulan
    return () => clearInterval(interval);
  }, [currentDate]);

  const startOfCurrentMonth = startOfMonth(currentDate);
  const startOfLastMonth = startOfMonth(subMonths(currentDate, 1));

  const { currentMonthRevenue, lastMonthRevenue } = useMemo(() => {
    if (loading || error || !products) {
      return { currentMonthRevenue: 0, lastMonthRevenue: 0 };
    }
    let currentMonthSum = 0;
    let lastMonthSum = 0;
    products.forEach((product) => {
      if (
        product.status?.toLowerCase() === "terjual" &&
        typeof product.price === "number"
      ) {
        const saleDate = getValidSaleDate(product);
        if (saleDate) {
          if (
            getMonth(saleDate) === getMonth(startOfCurrentMonth) &&
            getYear(saleDate) === getYear(startOfCurrentMonth)
          ) {
            currentMonthSum += product.price;
          }
          if (
            getMonth(saleDate) === getMonth(startOfLastMonth) &&
            getYear(saleDate) === getYear(startOfLastMonth)
          ) {
            lastMonthSum += product.price;
          }
        }
      }
    });
    return {
      currentMonthRevenue: currentMonthSum,
      lastMonthRevenue: lastMonthSum,
    };
  }, [
    products,
    loading,
    error,
    currentDate,
    startOfCurrentMonth,
    startOfLastMonth,
  ]);

  const achievementPercentage = useMemo(() => {
    if (STATIC_MONTHLY_TARGET === 0) return currentMonthRevenue > 0 ? 100 : 0;
    const percentage = (currentMonthRevenue / STATIC_MONTHLY_TARGET) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  }, [currentMonthRevenue]);

  const revenueChangeVsLastMonth = useMemo(() => {
    if (lastMonthRevenue === 0) {
      return currentMonthRevenue > 0 ? 100 : 0;
    }
    return ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
  }, [currentMonthRevenue, lastMonthRevenue]);

  const targetDifference = useMemo(() => {
    return currentMonthRevenue - STATIC_MONTHLY_TARGET;
  }, [currentMonthRevenue]);

  const series = [parseFloat(achievementPercentage.toFixed(2))];
  const options = {
    colors: ["#f97316"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: { size: "75%" },
        track: { background: "#E4E7EC", strokeWidth: "100%", margin: 5 },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "32px",
            fontWeight: "600",
            offsetY: 8,
            color: "#1D2939",
            formatter: (val) => `${val.toFixed(0)}%`,
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#f97316"] },
    stroke: { lineCap: "round" },
    labels: ["Pencapaian"],
  };

  const progressMessage = useMemo(() => {
    if (loading) return "Memuat data...";
    const targetFormatted = formatCurrency(STATIC_MONTHLY_TARGET);
    if (achievementPercentage >= 100) {
      return `Selamat! Target bulan ini sebesar ${targetFormatted} telah tercapai. Terus pertahankan!`;
    } else if (achievementPercentage >= 75) {
      return `Anda hampir mencapai target bulan ini (${targetFormatted}). Semangat!`;
    } else if (achievementPercentage >= 50) {
      return `Pencapaian Anda sudah setengah jalan menuju target ${targetFormatted}. Terus tingkatkan!`;
    } else {
      return `Terus kejar target bulan ini sebesar ${targetFormatted}. Anda pasti bisa!`;
    }
  }, [achievementPercentage, loading]);

  if (loading) {
    return (
      <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-gray-50 p-6 text-center">
        Memuat target bulanan...
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 text-red-500">
        Gagal memuat data untuk target bulanan.
      </div>
    );
  }

  return (
    <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-gray-50">
      <div className="px-5 pt-5 bg-white rounded-t-2xl md:border-b md:border-gray-200 pb-11 sm:px-6 sm:pt-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-md lg:text-lg font-medium text-gray-700">
              Target Bulan Ini (
              {formatDate(currentDate, "MMMM yyyy", { locale: localeID })})
            </h3>
          </div>
        </div>
        <div className="relative mt-4">
          <div className="max-h-[280px] flex justify-center items-center">
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={280}
              width={280}
            />
          </div>
          {currentMonthRevenue > 0 && lastMonthRevenue > 0 && (
            <span
              className={`absolute left-1/2 top-full -translate-x-1/2 -translate-y-[100%] rounded-full px-3 py-1 text-xs font-medium ${
                revenueChangeVsLastMonth >= 0
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {revenueChangeVsLastMonth >= 0 ? (
                <MdKeyboardArrowUp className="inline mr-0.5" />
              ) : (
                <MdKeyboardArrowDown className="inline mr-0.5" />
              )}
              {Math.abs(revenueChangeVsLastMonth).toFixed(0)}% vs Bulan Lalu
            </span>
          )}
        </div>
        <p className="mx-auto mt-8 w-full max-w-[420px] text-center text-sm text-gray-600 sm:text-base">
          {progressMessage}
        </p>
      </div>
      <div className="flex items-center justify-around gap-3 px-4 py-4 sm:gap-5 bg-white rounded-b-2xl">
        <div>
          <p className="mb-1 text-center text-gray-500 text-xs sm:text-sm">
            Target
          </p>
          <p className="flex items-center justify-center gap-1 text-sm font-semibold text-gray-800 sm:text-base">
            {formatCurrency(STATIC_MONTHLY_TARGET)}
          </p>
        </div>
        <div className="w-px bg-gray-300 h-7 self-center"></div>
        <div>
          <p className="mb-1 text-center text-gray-500 text-xs sm:text-sm">
            Pendapatan
          </p>
          <p
            className={`flex items-center justify-center gap-1 text-sm font-semibold sm:text-base ${
              currentMonthRevenue >= STATIC_MONTHLY_TARGET
                ? "text-green-600"
                : "text-orange-600"
            }`}
          >
            {formatCurrency(currentMonthRevenue)}
            {currentMonthRevenue !== 0 &&
              lastMonthRevenue !== 0 &&
              (currentMonthRevenue >= lastMonthRevenue ? (
                <MdKeyboardArrowUp className="text-green-500" />
              ) : (
                <MdKeyboardArrowDown className="text-red-500" />
              ))}
          </p>
        </div>
        <div className="w-px bg-gray-300 h-7 self-center"></div>
        <div>
          <p className="mb-1 text-center text-gray-500 text-xs sm:text-sm">
            {targetDifference >= 0 ? "Surplus" : "Sisa Target"}
          </p>
          <p
            className={`flex items-center justify-center gap-1 text-sm font-semibold sm:text-base ${
              targetDifference >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(Math.abs(targetDifference))}
            {targetDifference > 0 && (
              <MdKeyboardArrowUp className="text-green-500" />
            )}
            {targetDifference < 0 && (
              <MdKeyboardArrowDown className="text-red-500" />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
