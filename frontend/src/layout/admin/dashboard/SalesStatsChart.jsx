"use client";
import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import axiosInstance from "@/utils/axiosInstance";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  startOfYear,
  endOfYear,
  getYear,
  parseISO,
  isValid,
  subWeeks,
} from "date-fns";
import { id } from "date-fns/locale";
import { useExportData } from "@/hooks/useExportData";
import ExportDropdown from "@/components/product-admin/Dashboard/ExportDropdown";
import PeriodFilter from "@/components/product-admin/Dashboard/PeriodFilter";
import { useAutoScrollToChart } from "@/hooks/useAutoScrollToChart";
import DotLoader from "@/components/common/DotLoader";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

const safeParseISOForExport = (dateInput) => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isValid(dateInput) ? dateInput : null;
  if (typeof dateInput === "string") {
    const parsed = parseISO(dateInput);
    return isValid(parsed) ? parsed : null;
  }
  if (typeof dateInput === "number") {
    const parsed = new Date(dateInput);
    return isValid(parsed) ? parsed : null;
  }
  return null;
};

const SalesStatsChart = () => {
  const [selectedTab, setSelectedTab] = useState("Minggu");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const apiQueryPeriodMap = {
    Minggu: "weekly",
    Bulan: "monthly",
    Tahun: "yearly",
  };

  const {
    data: salesChartApiResponse,
    error: salesChartError,
    isLoading: salesChartLoading,
  } = useSWR(
    selectedTab && currentYear
      ? `/products/stats/sales?period=${apiQueryPeriodMap[selectedTab]}&year=${currentYear}`
      : null,
    fetcher,
    { revalidateOnFocus: true }
  );

  const processedChartData = useMemo(() => {
    const createDefaultCategories = (tab, year) => {
      const now = new Date();
      if (tab === "Minggu") {
        const lastWeek = startOfWeek(now, { weekStartsOn: 1 });
        return Array.from({ length: 12 }, (_, i) =>
          format(
            startOfWeek(subWeeks(lastWeek, 11 - i), { weekStartsOn: 1 }),
            "dd MMM",
            { locale: id }
          )
        );
      } else if (tab === "Bulan") {
        return Array.from({ length: 12 }, (_, i) =>
          format(startOfMonth(new Date(year, i)), "MMM yy", { locale: id })
        );
      } else if (tab === "Tahun") {
        return Array.from({ length: 5 }, (_, i) =>
          (getYear(now) - 4 + i).toString()
        );
      }
      return [];
    };

    const defaultCategories = createDefaultCategories(selectedTab, currentYear);
    const defaultReturn = {
      categories: defaultCategories,
      sales: Array(defaultCategories.length).fill(0),
      revenue: Array(defaultCategories.length).fill(0),
    };

    if (
      salesChartLoading ||
      salesChartError ||
      !salesChartApiResponse?.data?.chartValues
    ) {
      return defaultReturn;
    }
    const { categories, sales, revenue } =
      salesChartApiResponse.data.chartValues;
    if (!categories || !sales || !revenue || categories.length === 0) {
      return defaultReturn;
    }
    return { categories, sales, revenue };
  }, [
    salesChartApiResponse,
    salesChartLoading,
    salesChartError,
    selectedTab,
    currentYear,
  ]);

  const prepareExportData = () => {
    if (
      salesChartLoading ||
      salesChartError ||
      !salesChartApiResponse?.data?.exportableData?.items
    ) {
      toast.error("Data untuk ekspor tidak tersedia atau sedang dimuat.");
      return null;
    }

    const soldProductsForExport =
      salesChartApiResponse.data.exportableData.items;
    const totalRevenueForExport =
      salesChartApiResponse.data.exportableData.totalRevenue;

    if (soldProductsForExport.length === 0) {
      toast.error("Tidak ada data penjualan untuk diekspor pada periode ini.");
      return null;
    }

    let periodeText = "";
    const today = new Date();
    if (selectedTab === "Minggu") {
      const endDatePeriod = endOfWeek(today, { weekStartsOn: 1 });
      const startDatePeriod = startOfWeek(subWeeks(endDatePeriod, 11), {
        weekStartsOn: 1,
      });
      periodeText = `Periode: ${format(startDatePeriod, "dd MMM yy", {
        locale: id,
      })} - ${format(endDatePeriod, "dd MMM yy", { locale: id })}`;
    } else if (selectedTab === "Bulan") {
      periodeText = `Periode: Tahun ${currentYear}`;
    } else if (selectedTab === "Tahun") {
      const endYearDate = endOfYear(today);
      const startYearForPeriod = getYear(today) - 4;
      const startDatePeriod = startOfYear(new Date(startYearForPeriod, 0, 1));
      periodeText = `Periode: ${format(startDatePeriod, "dd MMM yy", {
        locale: id,
      })} - ${format(endYearDate, "dd MMM yy", { locale: id })}`;
    }

    const pdfData = soldProductsForExport.map((product, index) => {
      const actualSaleDate = product.saleDate
        ? safeParseISOForExport(product.saleDate)
        : null;
      return [
        index + 1,
        product.carName ||
          `${product.brand || ""} ${product.model || ""}`.trim(),
        actualSaleDate
          ? format(actualSaleDate, "dd MMM yy", { locale: id })
          : "-",
        `Rp ${product.price ? product.price.toLocaleString("id-ID") : "0"}`,
      ];
    });
    const csvData = soldProductsForExport.map((product, index) => {
      const actualSaleDate = product.saleDate
        ? safeParseISOForExport(product.saleDate)
        : null;
      return [
        index + 1,
        `"${
          product.carName ||
          `${product.brand || ""} ${product.model || ""}`.trim()
        }"`,
        actualSaleDate ? format(actualSaleDate, "yyyy-MM-dd") : "-",
        product.price || 0,
      ];
    });

    return {
      pdf: {
        title: "Laporan Penjualan Mobil",
        data: pdfData,
        columns: ["No", "Nama Mobil", "Tanggal Terjual", "Harga Jual (IDR)"],
        summaryData: [
          [
            "Total Unit Terjual:",
            soldProductsForExport.length.toLocaleString("id-ID"),
          ],
          [
            "Total Pendapatan:",
            `Rp ${totalRevenueForExport.toLocaleString("id-ID")}`,
          ],
        ],
        fileName: "Laporan_Penjualan_Mukrindo_Motor.pdf",
        periodeText,
      },
      csv: {
        headers: ["No", "Nama Mobil", "Tanggal Terjual", "Harga Jual (IDR)"],
        data: csvData,
        fileName: "Laporan_Penjualan_Mukrindo_Motor.csv",
      },
    };
  };

  const { handleExport } = useExportData(prepareExportData);

  const chartOptions = useMemo(
    () => ({
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
        fontFamily: "Outfit, sans-serif",
        fontWeight: 500,
        fontSize: "13px",
        labels: { colors: "#374151" },
        markers: {
          width: 10,
          height: 10,
          radius: 5,
          fillColors: ["#f97316", "#06b6d4"],
        },
        itemMargin: { horizontal: 10 },
      },
      colors: ["#f97316", "#06b6d4"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        height: 310,
        type: "area",
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true, easing: "easeinout", speed: 800 },
      },
      stroke: { curve: "smooth", width: [2.5, 2.5] },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.3,
          opacityFrom: 0.7,
          opacityTo: 0.1,
          stops: [0, 95, 100],
        },
      },
      markers: {
        size: 0,
        strokeColors: ["#f97316", "#06b6d4"],
        strokeWidth: 3,
        hover: { size: 6 },
      },
      grid: {
        borderColor: "#e5e7eb",
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      dataLabels: { enabled: false },
      tooltip: {
        theme: "light",
        x: {
          formatter: (val, { dataPointIndex, w }) =>
            w.globals.labels[dataPointIndex] || val,
        },
        y: [
          {
            title: { formatter: (seriesName) => `${seriesName}: ` },
            formatter: (val) => `${val ? val.toLocaleString("id-ID") : 0} unit`,
          },
          {
            title: { formatter: (seriesName) => `${seriesName}: ` },
            formatter: (val) => `Rp ${val ? val.toLocaleString("id-ID") : 0}`,
          },
        ],
      },
      xaxis: {
        type: "category",
        categories: processedChartData.categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
        labels: {
          style: { colors: "#6b7280", fontSize: "11px" },
          formatter: (val) =>
            typeof val === "string" &&
            val.length > 7 &&
            selectedTab === "Minggu"
              ? `${val.substring(0, 6)}.`
              : val,
        },
      },
      yaxis: [
        {
          seriesName: "Unit Terjual",
          title: {
            text: "Unit Terjual",
            style: { color: "#f97316", fontSize: "12px", fontWeight: 500 },
          },
          labels: {
            style: { colors: ["#f97316"], fontSize: "11px" },
            formatter: (val) => val.toFixed(0),
          },
          min: 0,
          forceNiceScale: true,
          tickAmount: 5,
        },
        {
          seriesName: "Pendapatan",
          opposite: true,
          title: {
            text: "Pendapatan (IDR)",
            style: { color: "#06b6d4", fontSize: "12px", fontWeight: 500 },
          },
          labels: {
            style: { colors: ["#06b6d4"], fontSize: "11px" },
            formatter: (val) => {
              if (val == null || isNaN(parseFloat(val))) return "Rp 0";
              const num = parseFloat(val);
              if (num >= 1000000000)
                return `Rp ${(num / 1000000000).toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: num % 1000000000 === 0 ? 0 : 1,
                })}M`;
              if (num >= 1000000)
                return `Rp ${(num / 1000000).toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}Jt`;
              if (num >= 1000)
                return `Rp ${(num / 1000).toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}Rb`;
              return `Rp ${num.toLocaleString("id-ID", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`;
            },
          },
          min: 0,
          forceNiceScale: true,
          tickAmount: 5,
        },
      ],
    }),
    [processedChartData, selectedTab]
  );

  const chartSeries = [
    { name: "Unit Terjual", data: processedChartData.sales },
    { name: "Pendapatan", data: processedChartData.revenue },
  ];

  const chartContainerRef = useAutoScrollToChart(
    { sales: processedChartData.sales, revenue: processedChartData.revenue },
    selectedTab,
    currentYear
  );

  if (salesChartLoading) {
    return (
      <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white px-4 pb-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-2 md:gap-5 mb-2 md:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full">
            <h3 className="text-md lg:text-lg font-medium text-gray-700 animate-pulse">
              Memuat Statistik Penjualan...
            </h3>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-start w-full gap-3 bg-gray-200 p-1 animate-pulse rounded-full sm:w-auto sm:justify-end">
              <div className="w-1/3 md:w-20 h-5 bg-white animate-pulse rounded-full" />
              <div className="w-1/3 md:w-20 h-5 bg-white animate-pulse rounded-full" />
              <div className="w-1/3 md:w-20 h-5 bg-white animate-pulse rounded-full" />
            </div>
            <div className="w-9 h-6 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
        <div
          className="flex flex-col gap-3 justify-center items-center w-full h-full text-gray-500"
          style={{ height: 310 }}
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

  if (salesChartError) {
    return (
      <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white px-4 pb-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            Statistik Penjualan
          </h3>
        </div>
        <div
          className="text-center py-10 text-red-500"
          style={{
            height: 310,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Gagal memuat data statistik. Error: {salesChartError.message}
        </div>
      </div>
    );
  }

  const hasActualData =
    processedChartData.sales.some((v) => v > 0) ||
    processedChartData.revenue.some((v) => v > 0);

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white px-4 pb-5 pt-5 sm:px-6 sm:pt-6"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-2 md:gap-5 mb-2 md:mb-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="w-full">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            {selectedTab === "Minggu" &&
              "Statistik Penjualan 12 Minggu Terakhir"}
            {selectedTab === "Bulan" &&
              `Statistik Penjualan Bulan (${currentYear})`}
            {selectedTab === "Tahun" && "Statistik Penjualan 5 Tahun Terakhir"}
          </h3>
        </div>
        <div className="flex items-start w-full gap-3 sm:w-auto sm:justify-end">
          <PeriodFilter
            currentYear={currentYear}
            setCurrentYear={setCurrentYear}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
          <ExportDropdown onExport={handleExport} className="relative" />
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
                {typeof window !== "undefined" && (
                  <ReactApexChart
                    options={chartOptions}
                    series={chartSeries}
                    type="area"
                    height={310}
                    width="100%"
                    key={`${selectedTab}-${
                      selectedTab === "Bulan" ? currentYear : ""
                    }`}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="py-2">
              <div
                className="text-center text-gray-500"
                style={{
                  height: 310,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                }}
              >
                Tidak ada data penjualan untuk periode ini.
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default SalesStatsChart;
