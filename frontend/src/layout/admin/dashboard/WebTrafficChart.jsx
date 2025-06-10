"use client";
import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useTraffic } from "@/context/TrafficContext";
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
import useSWR from "swr";
import PeriodFilter from "@/components/product-admin/Dashboard/PeriodFilter";
import { useAutoScrollToChart } from "@/hooks/useAutoScrollToChart";
import DotLoader from "@/components/common/DotLoader";
import { motion, AnimatePresence } from "framer-motion";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function WebTrafficChart() {
  const { getTrafficHistory } = useTraffic();
  const [selectedTab, setSelectedTab] = useState("Hari");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const apiQueryPeriodMap = {
    Hari: "daily",
    Minggu: "weekly",
    Bulan: "monthly",
    Tahun: "yearly",
  };

  const {
    data: trafficHistoryData,
    error: historyError,
    isLoading: historyLoading,
  } = useSWR(
    [apiQueryPeriodMap[selectedTab], currentYear],
    ([period, year]) => getTrafficHistory(period, year),
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

    if (selectedTab === "Hari") {
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
    } else if (selectedTab === "Minggu") {
      const endDate = endOfWeek(now, { weekStartsOn: 1 });
      const startDate = subWeeks(startOfWeek(endDate, { weekStartsOn: 1 }), 3);
      const weeks = eachWeekOfInterval(
        { start: startDate, end: endDate },
        { weekStartsOn: 1 }
      );
      weeks.forEach((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        let weeklyVisits = dataPoints.reduce((sum, point) => {
          const pointDate = parseISO(point.date);
          return (
            sum +
            (isValid(pointDate) &&
            isWithinInterval(pointDate, { start: weekStart, end: weekEnd })
              ? point.visits
              : 0)
          );
        }, 0);
        categories.push(format(weekStart, "dd MMM yy", { locale: id }));
        visitsData.push(weeklyVisits);
      });
    } else if (selectedTab === "Bulan") {
      const yearDate = new Date(currentYear, 0, 1);
      const months = eachMonthOfInterval({
        start: startOfYear(yearDate),
        end: endOfYear(yearDate),
      });
      months.forEach((monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        let monthlyVisits = dataPoints.reduce((sum, point) => {
          const pointDate = parseISO(point.date);
          return (
            sum +
            (isValid(pointDate) &&
            isWithinInterval(pointDate, { start: monthStart, end: monthEnd })
              ? point.visits
              : 0)
          );
        }, 0);
        categories.push(format(monthStart, "MMM yy", { locale: id }));
        visitsData.push(monthlyVisits);
      });
    } else if (selectedTab === "Tahun") {
      const years = eachYearOfInterval({
        start: subYears(startOfYear(now), 4),
        end: endOfYear(now),
      });
      years.forEach((yearStart) => {
        const yearEnd = endOfYear(yearStart);
        let yearlyVisits = dataPoints.reduce((sum, point) => {
          const pointDate = parseISO(point.date);
          return (
            sum +
            (isValid(pointDate) &&
            isWithinInterval(pointDate, { start: yearStart, end: yearEnd })
              ? point.visits
              : 0)
          );
        }, 0);
        categories.push(format(yearStart, "yyyy"));
        visitsData.push(yearlyVisits);
      });
    }

    return { categories, visits: visitsData };
  }, [
    trafficHistoryData,
    historyLoading,
    historyError,
    selectedTab,
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
        x: { show: true },
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
          formatter: (val) =>
            typeof val === "string" &&
            val.length > 7 &&
            (selectedTab === "Hari" || selectedTab === "Minggu")
              ? val.substring(0, 6) + "."
              : val,
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
    [processedChartData, selectedTab]
  );

  const chartSeries = useMemo(
    () => [{ name: "Kunjungan", data: processedChartData.visits }],
    [processedChartData]
  );
  const chartHeight = 280;

  const periodTitleMap = {
    Hari: "7 Hari Terakhir",
    Minggu: "4 Minggu Terakhir",
    Bulan: `Tahun ${currentYear}`,
    Tahun: "5 Tahun Terakhir",
  };

  const chartContainerRef = useAutoScrollToChart(
    { visits: processedChartData.visits },
    selectedTab,
    currentYear
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  if (historyLoading) {
    return (
      <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white px-4 pb-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-2 md:gap-5 mb-2 md:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full">
            <h3 className="text-md lg:text-lg font-medium text-gray-700 animate-pulse">
              Memuat Statistik Trafik...
            </h3>
          </div>

          <div className="flex items-start w-full gap-3 bg-gray-200 p-1 animate-pulse rounded-full sm:w-auto sm:justify-end">
            <div className="w-1/4 md:w-20 h-5 bg-white animate-pulse rounded-full" />
            <div className="w-1/4 md:w-20 h-5 bg-white animate-pulse rounded-full" />
            <div className="w-1/4 md:w-20 h-5 bg-white animate-pulse rounded-full" />
            <div className="w-1/4 md:w-20 h-5 bg-white animate-pulse rounded-full" />
          </div>
        </div>

        <div
          className="flex flex-col gap-3 justify-center items-center w-full h-full text-gray-500"
          style={{ height: `${chartHeight}px` }}
        >
          <DotLoader
            dotSize="w-5 h-5"
            textSize="text-xl"
            text="Memuat data..."
          />
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
          Gagal memuat data trafik. Silakan coba lagi nanti.
        </div>
      </div>
    );
  }

  const hasActualData =
    processedChartData.visits.length > 0 &&
    processedChartData.visits.some((v) => v > 0);

  return (
    <motion.div
      className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white px-4 pb-5 pt-5 sm:px-6 sm:pt-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-2 md:gap-5 mb-2 md:mb-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="w-full">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            Statistik Trafik Pengunjung {periodTitleMap[selectedTab]}
          </h3>
        </div>
        <div className="flex items-start w-full gap-3 sm:w-auto sm:justify-end">
          <PeriodFilter
            currentYear={currentYear}
            setCurrentYear={setCurrentYear}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            webTrafficChart={true}
          />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedTab}-${currentYear}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5 } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          {hasActualData ? (
            <div
              className="max-w-full overflow-x-auto custom-scrollbar"
              ref={chartContainerRef}
            >
              <div className="min-w-[600px] xl:min-w-full">
                <ReactApexChart
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
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
