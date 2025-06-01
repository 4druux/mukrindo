"use client";
import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { RiArrowUpDownFill } from "react-icons/ri";
import { useProducts } from "@/context/ProductContext";
import {
  startOfMonth,
  subMonths,
  getYear,
  getMonth,
  isValid,
  parseISO,
  format as formatDate,
} from "date-fns";
import { id as localeID } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import DotLoader from "@/components/common/DotLoader";

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

const STATIC_MONTHLY_TARGET = 1000000000;

export default function MonthlyTarget() {
  const { products, loading, error } = useProducts();
  const [displayCurrentDate, setDisplayCurrentDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setDisplayCurrentDate((prevDisplayDate) => {
        if (
          now.getMonth() !== prevDisplayDate.getMonth() ||
          now.getFullYear() !== prevDisplayDate.getFullYear()
        ) {
          return now;
        }
        return prevDisplayDate;
      });
    }, 3600000);
    return () => clearInterval(interval);
  }, []);

  const { currentMonthRevenue, lastMonthRevenue } = useMemo(() => {
    if (loading || error || !products) {
      return { currentMonthRevenue: 0, lastMonthRevenue: 0 };
    }

    const calculationTime = new Date();
    const actualStartOfCurrentMonth = startOfMonth(calculationTime);
    const actualStartOfLastMonth = startOfMonth(subMonths(calculationTime, 1));

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
            getMonth(saleDate) === getMonth(actualStartOfCurrentMonth) &&
            getYear(saleDate) === getYear(actualStartOfCurrentMonth)
          ) {
            currentMonthSum += product.price;
          }
          if (
            getMonth(saleDate) === getMonth(actualStartOfLastMonth) &&
            getYear(saleDate) === getYear(actualStartOfLastMonth)
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
  }, [products, loading, error]);

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

  const series = useMemo(() => {
    return [parseFloat(achievementPercentage.toFixed(2))];
  }, [achievementPercentage]);

  const options = useMemo(
    () => ({
      colors: ["#f97316"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "radialBar",
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
              fontWeight: "500",
              offsetY: -30,
              color: "#374151",
              formatter: (val) => `${val.toFixed(0)}%`,
            },
          },
        },
      },
      states: {
        active: {
          filter: {
            type: "none",
          },
        },
      },
      fill: { type: "solid", colors: ["#f97316"] },
      stroke: { lineCap: "round" },
      labels: ["Pencapaian"],
    }),
    []
  );

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
      <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white">
        <div className="px-5 pt-5 md:border-b md:border-gray-200 pb-5 md:px-6 md:pt-6">
          <h3 className="text-md lg:text-lg font-medium text-gray-700 animate-pulse">
            Memuat target bulanan...
          </h3>
          <div
            className="flex flex-col gap-3 justify-center items-center w-full h-full text-gray-500"
            style={{ height: "350px" }}
          >
            <DotLoader
              dotSize="w-5 h-5"
              textSize="text-xl"
              text="Memuat data..."
            />
          </div>
        </div>
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
      <div className="px-5 pt-5 bg-white rounded-t-2xl md:border-b md:border-gray-200 pb-5 md:px-6 md:pt-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-md lg:text-lg font-medium text-gray-700">
              Target Bulan Ini (
              {formatDate(displayCurrentDate, "MMMM yyyy", {
                locale: localeID,
              })}
              )
            </h3>
          </div>
        </div>
        <div className="relative mt-4">
          <div className="max-h-[280px] flex justify-center items-center">
            {typeof window !== "undefined" && (
              <ReactApexChart
                key={series[0]}
                options={options}
                series={series}
                type="radialBar"
                height={280}
                width={280}
              />
            )}
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
                <RiArrowUpDownFill className="inline mr-0.5" />
              ) : (
                <RiArrowUpDownFill className="inline mr-0.5" />
              )}
              {Math.abs(revenueChangeVsLastMonth).toFixed(0)}% vs Bulan Lalu
            </span>
          )}
        </div>
        <p className="mx-auto mt-3 w-full max-w-[420px] text-center text-xs md:text-sm text-gray-600">
          {progressMessage}
        </p>
      </div>

      <div className="flex flex-col items-center justify-around gap-3 px-4 py-4 bg-white rounded-b-2xl">
        <div className="flex items-start justify-between w-full border-b md:border-none border-gray-200 pb-3 md:pb-0">
          <p className="mb-1 text-center text-gray-500 text-sm">Target</p>
          <p className="flex items-center justify-center gap-1 text-sm font-semibold text-gray-700">
            {formatCurrency(STATIC_MONTHLY_TARGET)}
          </p>
        </div>

        <div className="flex items-start justify-between w-full border-b md:border-none border-gray-200 pb-3 md:pb-0">
          <p className="mb-1 text-center text-gray-500 text-sm">Pendapatan</p>
          <p
            className={`flex items-center justify-center gap-1 text-sm font-semibold ${
              currentMonthRevenue >= STATIC_MONTHLY_TARGET
                ? "text-green-600"
                : "text-gray-700"
            }`}
          >
            {currentMonthRevenue !== 0 &&
              lastMonthRevenue !== 0 &&
              (currentMonthRevenue >= lastMonthRevenue ? (
                <RiArrowUpDownFill className="w-4 h-4 text-green-600" />
              ) : (
                <RiArrowUpDownFill className="w-4 h-4 text-red-500" />
              ))}
            {formatCurrency(currentMonthRevenue)}
          </p>
        </div>

        <div className="flex items-start justify-between w-full">
          <p className="mb-1 text-center text-gray-500 text-sm">
            {targetDifference >= 0 ? "Surplus" : "Sisa Target"}
          </p>
          <p
            className={`flex items-center justify-center gap-1 text-sm font-semibold ${
              targetDifference >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {targetDifference > 0 && (
              <RiArrowUpDownFill className="w-4 h-4 text-green-600" />
            )}
            {targetDifference < 0 && (
              <RiArrowUpDownFill className="w-4 h-4 text-red-500" />
            )}
            {formatCurrency(Math.abs(targetDifference))}
          </p>
        </div>
      </div>
    </div>
  );
}
