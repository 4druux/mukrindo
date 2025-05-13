"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import axios from "axios";
import {
  format,
  parseISO,
  isValid,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfWeek,
  endOfMonth,
  endOfYear,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  isWithinInterval,
  subDays,
  subWeeks,
  subMonths,
  subYears,
} from "date-fns";
import { id } from "date-fns/locale";
import { FaChevronDown } from "react-icons/fa";
import { useYearDropdown } from "@/hooks/useYearDropdown";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const HISTORY_API_ENDPOINT = `${API_BASE_URL}/api/visits/homepage/history`;

const fetcher = (url) =>
  axios.get(url, { withCredentials: true }).then((res) => res.data);

export default function WebTrafficChart() {
  const [selectedPeriod, setSelectedPeriod] = useState("Hari");
  const {
    currentYear,
    setCurrentYear,
    isYearDropdownOpen,
    setIsYearDropdownOpen,
    yearDropdownRef,
  } = useYearDropdown();

  const apiQueryPeriodMap = {
    Hari: "daily",
    Minggu: "weekly",
    Bulan: "monthly",
    Tahun: "yearly",
  };

  // Generate available years (e.g., last 5 years + current year)
  const availableYears = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => current - 5 + i + 1).sort(
      (a, b) => b - a
    );
  }, []);

  const {
    data: trafficHistoryData,
    error: historyError,
    isLoading: historyLoading,
  } = useSWR(
    // Always pass currentYear, backend might ignore if period is not monthly
    `${HISTORY_API_ENDPOINT}?period=${apiQueryPeriodMap[selectedPeriod]}&year=${currentYear}`,
    fetcher,
    { revalidateOnFocus: true }
  );

  const processedChartData = useMemo(() => {
    if (historyLoading || historyError || !trafficHistoryData?.data) {
      return { categories: [], visits: [] };
    }

    const dataPoints = trafficHistoryData.data;
    if (!dataPoints || dataPoints.length === 0) {
      return { categories: [], visits: [] };
    }

    const now = new Date();
    let categories = [];
    let visitsData = [];

    if (selectedPeriod === "Hari") {
      const last7Days = Array.from({ length: 7 }, (_, i) =>
        subDays(startOfDay(now), 6 - i)
      );
      last7Days.forEach((day) => {
        const matchingData = dataPoints.find((point) => {
          const pointDate = parseISO(point.date);
          return (
            isValid(pointDate) &&
            startOfDay(pointDate).getTime() === day.getTime()
          );
        });
        categories.push(format(day, "dd MMM yy", { locale: id }));
        visitsData.push(matchingData?.visits || 0);
      });
    } else if (selectedPeriod === "Minggu") {
      const endDate = endOfWeek(now, { weekStartsOn: 1 });
      const startDate = subWeeks(startOfWeek(endDate, { weekStartsOn: 1 }), 3); // Ensure start of the week
      const weeks = eachWeekOfInterval(
        { start: startDate, end: endDate },
        { weekStartsOn: 1 }
      );
      weeks.forEach((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        let weeklyVisits = 0;
        dataPoints.forEach((point) => {
          const pointDate = parseISO(point.date);
          if (
            isValid(pointDate) &&
            isWithinInterval(pointDate, { start: weekStart, end: weekEnd })
          ) {
            weeklyVisits += point.visits || 0;
          }
        });
        categories.push(format(weekStart, "dd MMM yy", { locale: id }));
        visitsData.push(weeklyVisits);
      });
    } else if (selectedPeriod === "Bulan") {
      // Use currentYear state for monthly view
      const yearDate = new Date(currentYear, 0, 1);
      const months = eachMonthOfInterval({
        start: startOfYear(yearDate),
        end: endOfYear(yearDate),
      });
      months.forEach((monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        let monthlyVisits = 0;
        // Filter data points relevant to the selected year first for efficiency
        const yearDataPoints = dataPoints.filter((point) => {
          const pointDate = parseISO(point.date);
          return isValid(pointDate) && pointDate.getFullYear() === currentYear;
        });
        yearDataPoints.forEach((point) => {
          const pointDate = parseISO(point.date);
          // Double check interval, though filtering helps
          if (
            isValid(pointDate) &&
            isWithinInterval(pointDate, { start: monthStart, end: monthEnd })
          ) {
            monthlyVisits += point.visits || 0;
          }
        });
        categories.push(format(monthStart, "MMM yyyy", { locale: id }));
        visitsData.push(monthlyVisits);
      });
    } else if (selectedPeriod === "Tahun") {
      const years = eachYearOfInterval({
        start: subYears(startOfYear(now), 4),
        end: endOfYear(now), // Ensure we include the current year fully
      });
      years.forEach((yearStart) => {
        const yearEnd = endOfYear(yearStart);
        let yearlyVisits = 0;
        dataPoints.forEach((point) => {
          const pointDate = parseISO(point.date);
          if (
            isValid(pointDate) &&
            isWithinInterval(pointDate, { start: yearStart, end: yearEnd })
          ) {
            yearlyVisits += point.visits || 0;
          }
        });
        categories.push(format(yearStart, "yyyy"));
        visitsData.push(yearlyVisits);
      });
    }

    return { categories, visits: visitsData };
  }, [
    trafficHistoryData,
    historyLoading,
    historyError,
    selectedPeriod,
    currentYear,
  ]);

  const chartOptions = useMemo(
    () => ({
      chart: {
        fontFamily: "Outfit, sans-serif",
        height: 280,
        type: "area",
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
          animateGradually: { enabled: true, delay: 150 },
          dynamicAnimation: { enabled: true, speed: 350 },
        },
      },
      colors: ["#0d9488"],
      stroke: { curve: "smooth", width: 2.5, lineCap: "round" },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.3,
          gradientToColors: ["#0d9488"],
          inverseColors: false,
          opacityFrom: 0.7,
          opacityTo: 0.1,
          stops: [0, 95, 100],
        },
      },
      markers: {
        size: 0,
        strokeColors: ["#0d9488"],
        strokeWidth: 3,
        hover: { size: 6, sizeOffset: 3 },
      },
      grid: {
        borderColor: "#e5e7eb",
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      dataLabels: { enabled: false },
      tooltip: {
        enabled: true,
        theme: "light",
        style: { fontSize: "12px", fontFamily: "Outfit, sans-serif" },
        x: {
          show: true,
          // Format tooltip x-axis based on period
          formatter: function (val, { dataPointIndex, w }) {
            const category = w.globals.labels[dataPointIndex] || val;
            // Re-parse based on expected format if needed, or just display category
            return category;
          },
        },
        y: {
          formatter: (val) =>
            `${val ? val.toLocaleString("id-ID") : 0} kunjungan`,
          title: { formatter: () => "Kunjungan" },
        },
        marker: { show: true },
      },
      xaxis: {
        type: "category",
        categories: processedChartData.categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
        labels: {
          style: {
            colors: "#6b7280",
            fontSize: "11px",
            fontFamily: "Outfit, sans-serif",
          },
          formatter: function (val) {
            // Shorten labels for daily/weekly if too long
            if (
              typeof val === "string" &&
              val.length > 7 &&
              (selectedPeriod === "Hari" || selectedPeriod === "Minggu")
            ) {
              return val.substring(0, 6) + "."; // e.g., "15 Jul."
            }
            // For monthly, it shows "MMM yyyy" which is fine
            // For yearly, it shows "yyyy" which is fine
            return val;
          },
        },
      },
      yaxis: {
        seriesName: "Kunjungan",
        title: {
          text: "Jumlah Kunjungan",
          style: {
            color: "#0d9488",
            fontSize: "12px",
            fontWeight: 500,
            fontFamily: "Outfit, sans-serif",
          },
        },
        labels: {
          style: { colors: ["#0d9488"], fontSize: "11px" },
          formatter: (val) => val.toFixed(0),
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        min: 0,
        forceNiceScale: true,
        tickAmount: 5,
      },
    }),
    [processedChartData, selectedPeriod] // Dependency on selectedPeriod for label formatting
  );

  const chartSeries = useMemo(
    () => [{ name: "Kunjungan", data: processedChartData.visits }],
    [processedChartData]
  );

  const chartHeight = chartOptions.chart.height;

  // Update title map
  const periodTitleMap = {
    Hari: "7 Hari Terakhir",
    Minggu: "4 Minggu Terakhir",
    Bulan: `Bulan ${currentYear}`, // Dynamic title for monthly
    Tahun: "5 Tahun Terakhir",
  };

  if (historyLoading) {
    return (
      <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white px-4 pb-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            Memuat Statistik Trafik...
          </h3>
        </div>
        <div className="animate-pulse" style={{ height: `${chartHeight}px` }}>
          <div className="h-full bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  if (historyError) {
    return (
      <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white px-4 pb-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            Statistik Trafik Pengunjung
          </h3>
        </div>
        <div
          className="text-center py-10 text-red-500"
          style={{
            height: `${chartHeight}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Gagal memuat data trafik. Silakan coba lagi nanti. Error:{" "}
          {historyError.message}
        </div>
      </div>
    );
  }

  const hasActualData =
    processedChartData.visits.length > 0 &&
    processedChartData.visits.some((v) => v > 0);

  return (
    <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white px-4 pb-5 pt-5 sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-2 md:gap-5 mb-2 md:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            Statistik Trafik Pengunjung {periodTitleMap[selectedPeriod]}
          </h3>
        </div>
        <div className="flex items-start w-full gap-3 sm:w-auto sm:justify-end">
          <div className="flex items-center gap-0.5 rounded-full bg-gray-100 p-1 w-full sm:w-auto">
            {["Hari", "Minggu", "Bulan", "Tahun"].map((period) => {
              if (period === "Bulan") {
                return (
                  <div key={period} className="relative" ref={yearDropdownRef}>
                    <button
                      onClick={() => {
                        const isOpening = !isYearDropdownOpen;
                        setSelectedPeriod("Bulan");
                        setIsYearDropdownOpen(isOpening);
                      }}
                      className={`px-3 py-1.5 font-semibold w-full rounded-full text-xs cursor-pointer  transition-colors duration-150 flex items-center justify-center gap-1 whitespace-nowrap ${
                        selectedPeriod === period
                          ? "text-emerald-600 bg-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {period} {currentYear}
                      <FaChevronDown
                        className={`h-3 w-3 transition-transform ${
                          isYearDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isYearDropdownOpen && selectedPeriod === "Bulan" && (
                      <div className="absolute z-20 mt-1 right-0 w-full min-w-[80px] rounded-xl bg-white shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
                        <ul className="py-1">
                          {availableYears.map((year) => (
                            <li
                              key={year}
                              onClick={() => {
                                setCurrentYear(year);
                                setIsYearDropdownOpen(false);
                              }}
                              className={`px-3 py-1.5 text-xs text-center cursor-pointer ${
                                year === currentYear
                                  ? "font-semibold text-emerald-600 bg-emerald-50"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {year}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <button
                    key={period}
                    onClick={() => {
                      setSelectedPeriod(period);
                      setIsYearDropdownOpen(false);
                    }}
                    className={`px-3 py-1.5 font-semibold w-full rounded-full text-xs cursor-pointer transition-colors duration-150 ${
                      selectedPeriod === period
                        ? "text-emerald-600 bg-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {period}
                  </button>
                );
              }
            })}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      {hasActualData ? (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[600px] xl:min-w-full">
            <ReactApexChart
              key={`${selectedPeriod}-${
                selectedPeriod === "Bulan" ? currentYear : ""
              }`}
              options={chartOptions}
              series={chartSeries}
              type="area"
              height={chartHeight}
              width={"100%"}
            />
          </div>
        </div>
      ) : (
        <div className="py-2">
          <div
            className="text-center text-gray-500"
            style={{
              height: `${chartHeight}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.875rem",
            }}
          >
            {historyLoading
              ? "Memuat data..."
              : "Tidak ada data kunjungan untuk periode ini."}
          </div>
        </div>
      )}
    </div>
  );
}
