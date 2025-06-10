"use client";
import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import axiosInstance from "@/utils/axiosInstance";
import { FaCar, FaBoxOpen } from "react-icons/fa";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  startOfYear,
  endOfYear,
  parseISO,
  isValid,
  getYear,
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

const ProductReportChart = () => {
  const [selectedTab, setSelectedTab] = useState("Minggu");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const apiQueryPeriodMap = {
    Minggu: "weekly",
    Bulan: "monthly",
    Tahun: "yearly",
  };

  const {
    data: reportChartApiResponse,
    error: reportChartError,
    isLoading: reportChartLoading,
  } = useSWR(
    selectedTab && currentYear
      ? `/api/products/stats/report?period=${apiQueryPeriodMap[selectedTab]}&year=${currentYear}`
      : null,
    fetcher,
    { revalidateOnFocus: true }
  );

  const processedData = useMemo(() => {
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
      masuk: Array(defaultCategories.length).fill(0),
      terjual: Array(defaultCategories.length).fill(0),
    };

    if (
      reportChartLoading ||
      reportChartError ||
      !reportChartApiResponse?.data?.chartValues
    ) {
      return defaultReturn;
    }
    const { categories, masuk, terjual } =
      reportChartApiResponse.data.chartValues;
    if (!categories || !masuk || !terjual || categories.length === 0) {
      return defaultReturn;
    }
    return { categories, masuk, terjual };
  }, [
    reportChartApiResponse,
    reportChartLoading,
    reportChartError,
    selectedTab,
    currentYear,
  ]);

  const prepareExportData = () => {
    if (
      reportChartLoading ||
      reportChartError ||
      !reportChartApiResponse?.data?.exportableData?.items
    ) {
      toast.error("Data untuk ekspor tidak tersedia atau sedang dimuat.", {
        className: "custom-toast",
      });
      return null;
    }

    const productsForExport = reportChartApiResponse.data.exportableData.items;
    if (productsForExport.length === 0) {
      toast.error("Tidak ada data produk untuk diekspor pada periode ini.", {
        className: "custom-toast",
      });
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

    const pdfData = productsForExport.map((product, index) => {
      const entryDate = product.createdAt
        ? safeParseISOForExport(product.createdAt)
        : null;
      const saleDate = product.effectiveSaleDate
        ? safeParseISOForExport(product.effectiveSaleDate)
        : null;
      return [
        index + 1,
        product.carName ||
          `${product.brand || ""} ${product.model || ""}`.trim() ||
          "N/A",
        `Rp ${product.price ? product.price.toLocaleString("id-ID") : "0"}`,
        entryDate ? format(entryDate, "dd MMM yy", { locale: id }) : "-",
        saleDate ? format(saleDate, "dd MMM yy", { locale: id }) : "-",
        product.status || "N/A",
      ];
    });
    const csvData = productsForExport.map((product, index) => {
      const entryDate = product.createdAt
        ? safeParseISOForExport(product.createdAt)
        : null;
      const saleDate = product.effectiveSaleDate
        ? safeParseISOForExport(product.effectiveSaleDate)
        : null;
      return [
        index + 1,
        `"${
          product.carName ||
          `${product.brand || ""} ${product.model || ""}`.trim() ||
          "N/A"
        }"`,
        product.price || 0,
        entryDate ? format(entryDate, "yyyy-MM-dd") : "-",
        saleDate ? format(saleDate, "yyyy-MM-dd") : "-",
        product.status || "N/A",
      ];
    });

    const totalMasuk = productsForExport.filter((p) =>
      safeParseISOForExport(p.createdAt)
    ).length;
    const totalTerjual = productsForExport.filter(
      (p) =>
        p.status?.toLowerCase() === "terjual" &&
        safeParseISOForExport(p.effectiveSaleDate)
    ).length;

    return {
      pdf: {
        title: "Laporan Produk Mobil",
        data: pdfData,
        columns: [
          "No",
          "Nama Mobil",
          "Harga Jual (IDR)",
          "Tanggal Masuk",
          "Tanggal Terjual",
          "Status",
        ],
        summaryData: [
          [
            "Total Produk Masuk (dalam periode):",
            totalMasuk.toLocaleString("id-ID"),
          ],
          [
            "Total Produk Terjual (dalam periode):",
            totalTerjual.toLocaleString("id-ID"),
          ],
        ],
        fileName: "Laporan_Produk_Mobil_Mukrindo.pdf",
        periodeText,
      },
      csv: {
        headers: [
          "No",
          "Nama Mobil",
          "Harga Jual (IDR)",
          "Tanggal Masuk",
          "Tanggal Terjual",
          "Status",
        ],
        data: csvData,
        fileName: "Laporan_Produk_Mobil_Mukrindo.csv",
      },
    };
  };

  const { handleExport } = useExportData(prepareExportData);

  const options = useMemo(
    () => ({
      colors: ["#F4784A", "#9AD8D8"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "bar",
        height: 350,
        stacked: true,
        toolbar: { show: false },
        animations: { enabled: true, easing: "easeinout", speed: 800 },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "45%",
          borderRadius: 6,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 1, colors: ["#fff"] },
      xaxis: {
        categories: processedData.categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: "#6b7280", fontSize: "11px" },
          formatter: (val) =>
            selectedTab === "Minggu" && val && val.length > 7
              ? `${val.substring(0, 6)}.`
              : val,
        },
      },
      yaxis: {
        title: {
          text: "Jumlah Produk",
          style: { fontSize: "12px", fontWeight: 500, color: "#6b7280" },
        },
        labels: {
          style: { colors: "#6b7280", fontSize: "11px" },
          formatter: (val) => val.toFixed(0),
        },
        min: 0,
        forceNiceScale: true,
        tickAmount: 5,
      },
      grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
      states: {
        hover: { filter: { type: "none" } },
        active: { filter: { type: "none" } },
      },
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
          fillColors: ["#F4784A", "#9AD8D8"],
        },
        itemMargin: { horizontal: 10 },
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val) => `${val ? val.toLocaleString("id-ID") : 0} unit`,
        },
      },
    }),
    [processedData, selectedTab]
  );

  const series = [
    { name: "Produk Masuk", data: processedData.masuk },
    { name: "Produk Terjual", data: processedData.terjual },
  ];

  const chartContainerRef = useAutoScrollToChart(
    { masuk: processedData.masuk, terjual: processedData.terjual },
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

  if (reportChartLoading) {
    return (
      <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-2 md:gap-5 mb-2 md:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full">
            <h3 className="text-md lg:text-lg font-medium text-gray-700 animate-pulse">
              Memuat Laporan Produk...
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
          style={{ height: 350 }}
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

  if (reportChartError) {
    return (
      <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-2 md:gap-5 mb-2 md:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            Laporan Produk Mobil
          </h3>
        </div>
        <div
          className="text-center py-10 text-red-500"
          style={{
            height: 350,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Gagal memuat data produk. Error: {reportChartError.message}
        </div>
      </div>
    );
  }

  const hasActualData =
    processedData.masuk.some((v) => v > 0) ||
    processedData.terjual.some((v) => v > 0);
  const totalMasukSummary = processedData.masuk.reduce((a, b) => a + b, 0);
  const totalTerjualSummary = processedData.terjual.reduce((a, b) => a + b, 0);

  return (
    <motion.div
      className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white p-4 sm:p-6"
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
            {selectedTab === "Minggu" &&
              "Laporan Produk Mobil 12 Minggu Terakhir"}
            {selectedTab === "Bulan" &&
              `Laporan Produk Mobil Tahun ${currentYear}`}
            {selectedTab === "Tahun" && "Laporan Produk Mobil 5 Tahun Terakhir"}
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
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
          exit={{ opacity: 0, y: -15, transition: { duration: 0.2 } }}
          className="w-full"
        >
          {hasActualData ? (
            <div
              className="max-w-full overflow-x-auto custom-scrollbar"
              ref={chartContainerRef}
            >
              <div className="min-w-[600px] xl:min-w-full">
                {typeof window !== "undefined" && (
                  <ReactApexChart
                    options={options}
                    series={series}
                    type="bar"
                    height={350}
                    width="100%"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="py-2">
              <div
                className="text-center text-gray-500"
                style={{
                  height: 350,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                }}
              >
                Tidak ada data produk untuk periode ini.
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <motion.div
        variants={itemVariants}
        className="mt-4 md:mt-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-start"
      >
        <motion.div
          className="flex-1 min-w-[200px]"
          whileHover={{ y: -3, transition: { type: "spring", stiffness: 300 } }}
        >
          <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50 h-full">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
              <FaCar className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600">
                Total Produk Masuk
              </h4>
              <p className="text-lg font-semibold text-gray-600">
                {totalMasukSummary.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="flex-1 min-w-[200px]"
          whileHover={{ y: -3, transition: { type: "spring", stiffness: 300 } }}
        >
          <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50 h-full">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-teal-100 rounded-lg">
              <FaBoxOpen className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600">
                Total Produk Terjual
              </h4>
              <p className="text-lg font-semibold text-gray-600">
                {totalTerjualSummary.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ProductReportChart;
