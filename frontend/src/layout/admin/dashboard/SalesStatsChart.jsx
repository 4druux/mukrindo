"use client";
import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useProducts } from "@/context/ProductContext";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachWeekOfInterval,
  getYear,
  getMonth,
  isWithinInterval,
  parseISO,
  isValid,
} from "date-fns";
import { id } from "date-fns/locale";
import { useExportData } from "@/hooks/useExportData";
import ExportDropdown from "@/components/product-admin/Dashboard/ExportDropdown";
import PeriodFilter from "@/components/product-admin/Dashboard/PeriodFilter";
import { Loader2 } from "lucide-react";
import { useAutoScrollToChart } from "@/hooks/useAutoScrollToChart";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const getValidSaleDate = (product) => {
  const dateStr = product.soldDate || product.updatedAt;
  if (!dateStr) return null;

  try {
    const dateObj = parseISO(dateStr);
    const fallbackDate = new Date(dateStr);
    return isValid(dateObj)
      ? dateObj
      : isValid(fallbackDate)
      ? fallbackDate
      : null;
  } catch {
    return null;
  }
};

const SalesStatsChart = () => {
  const { products, loading, error } = useProducts();
  const [selectedTab, setSelectedTab] = useState("Minggu");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const prepareExportData = () => {
    let soldProducts = products.filter((p) => {
      const saleDate = getValidSaleDate(p);
      return (
        p.status?.toLowerCase() === "terjual" &&
        typeof p.price === "number" &&
        p.price > 0 &&
        saleDate &&
        isValid(saleDate)
      );
    });

    if (soldProducts.length > 0) {
      soldProducts.sort((a, b) => {
        const dateA = getValidSaleDate(a);
        const dateB = getValidSaleDate(b);

        return dateB.getTime() - dateA.getTime();
      });
    }

    const hasDataForPeriod =
      processedChartData.sales.some((v) => v > 0) ||
      processedChartData.revenue.some((v) => v > 0);

    if (soldProducts.length === 0 || !hasDataForPeriod) {
      return null;
    }

    let periodeText = "";
    const today = new Date();
    if (selectedTab === "Minggu") {
      const endDatePeriod = endOfWeek(today, { weekStartsOn: 1 });
      const startDatePeriod = startOfWeek(
        new Date(
          endDatePeriod.getFullYear(),
          endDatePeriod.getMonth(),
          endDatePeriod.getDate() - (12 - 1) * 7
        ),
        { weekStartsOn: 1 }
      );
      periodeText = `Periode: ${format(startDatePeriod, "dd MMM yyyy", {
        locale: id,
      })} - ${format(endDatePeriod, "dd MMM yyyy", { locale: id })}`;
    } else if (selectedTab === "Bulan") {
      const startDatePeriod = startOfMonth(new Date(currentYear, 0));
      const endDatePeriod = endOfMonth(new Date(currentYear, 11));
      periodeText = `Periode: ${format(startDatePeriod, "dd MMM yyyy", {
        locale: id,
      })} - ${format(endDatePeriod, "dd MMM yyyy", { locale: id })}`;
    } else if (selectedTab === "Tahun") {
      const currentActualYear = getYear(today);
      const endYearDate = endOfYear(new Date(currentActualYear, 11, 31));
      const startYearForPeriod = currentActualYear - 4;
      const startDatePeriod = startOfYear(new Date(startYearForPeriod, 0, 1));
      periodeText = `Periode: ${format(startDatePeriod, "dd MMM yyyy", {
        locale: id,
      })} - ${format(endYearDate, "dd MMM yyyy", { locale: id })}`;
    }

    const pdfData = soldProducts.map((product, index) => {
      const actualSaleDate = getValidSaleDate(product);
      return [
        index + 1,
        product.carName || `${product.brand} ${product.model}`.trim(),
        format(actualSaleDate, "dd MMM yyyy", { locale: id }),
        `Rp ${product.price.toLocaleString("id-ID")}`,
      ];
    });

    const csvData = soldProducts.map((product, index) => {
      const actualSaleDate = getValidSaleDate(product);
      return [
        index + 1,
        `"${product.carName || `${product.brand} ${product.model}`.trim()}"`,
        format(actualSaleDate, "yyyy-MM-dd"),
        product.price,
      ];
    });

    const totalRevenue = soldProducts.reduce((sum, p) => sum + p.price, 0);

    return {
      pdf: {
        title: "Laporan Penjualan Mobil",
        data: pdfData,
        columns: ["No", "Nama Mobil", "Tanggal Terjual", "Harga Jual (IDR)"],
        summaryData: [
          ["Total Unit Terjual:", soldProducts.length.toLocaleString("id-ID")],
          ["Total Pendapatan:", `Rp ${totalRevenue.toLocaleString("id-ID")}`],
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

  const processedChartData = useMemo(() => {
    const createDefaultData = () => {
      let defaultCategories = [];
      if (selectedTab === "Minggu") {
        const lastWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
        defaultCategories = Array.from({ length: 12 }, (_, i) =>
          format(
            startOfWeek(
              new Date(
                lastWeek.getFullYear(),
                lastWeek.getMonth(),
                lastWeek.getDate() - (11 - i) * 7
              ),
              { weekStartsOn: 1 }
            ),
            "dd MMM",
            { locale: id }
          )
        );
      } else if (selectedTab === "Bulan") {
        defaultCategories = Array.from({ length: 12 }, (_, i) =>
          format(startOfMonth(new Date(currentYear, i)), "MMM yyyy", {
            locale: id,
          })
        );
      } else if (selectedTab === "Tahun") {
        defaultCategories = Array.from({ length: 5 }, (_, i) =>
          (new Date().getFullYear() - 4 + i).toString()
        );
      }
      return {
        categories: defaultCategories,
        sales: Array(defaultCategories.length).fill(0),
        revenue: Array(defaultCategories.length).fill(0),
      };
    };

    if (loading || error || !products || products.length === 0) {
      return createDefaultData();
    }

    const soldProducts = products.filter((p) => {
      const saleDate = getValidSaleDate(p);
      return (
        p.status?.toLowerCase() === "terjual" &&
        typeof p.price === "number" &&
        p.price > 0 &&
        saleDate
      );
    });

    if (soldProducts.length === 0) {
      return createDefaultData();
    }

    let categories = [];
    let salesData = [];
    let revenueData = [];

    if (selectedTab === "Minggu") {
      const endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
      const startDate = startOfWeek(
        new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate() - 12 * 7 + 1
        ),
        { weekStartsOn: 1 }
      );
      const weeks = eachWeekOfInterval(
        { start: startDate, end: endDate },
        { weekStartsOn: 1 }
      );

      categories = weeks.map((weekStart) =>
        format(weekStart, "dd MMM", { locale: id })
      );
      salesData = Array(weeks.length).fill(0);
      revenueData = Array(weeks.length).fill(0);

      soldProducts.forEach((p) => {
        const saleDate = getValidSaleDate(p);
        if (saleDate) {
          const weekIndex = weeks.findIndex((weekStart) => {
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
            return isWithinInterval(saleDate, {
              start: weekStart,
              end: weekEnd,
            });
          });
          if (weekIndex !== -1) {
            salesData[weekIndex] += 1;
            revenueData[weekIndex] += p.price;
          }
        }
      });
    } else if (selectedTab === "Bulan") {
      const months = Array.from({ length: 12 }, (_, i) =>
        startOfMonth(new Date(currentYear, i))
      );
      categories = months.map((monthStart) =>
        format(monthStart, "MMM yyyy", { locale: id })
      );
      salesData = Array(12).fill(0);
      revenueData = Array(12).fill(0);

      soldProducts.forEach((p) => {
        const saleDate = getValidSaleDate(p);
        if (saleDate && getYear(saleDate) === currentYear) {
          const monthIndex = getMonth(saleDate);
          salesData[monthIndex] += 1;
          revenueData[monthIndex] += p.price;
        }
      });
    } else if (selectedTab === "Tahun") {
      const endYear = getYear(new Date());
      const startYear = endYear - 4;
      const years = Array.from({ length: 5 }, (_, i) =>
        startOfYear(new Date(startYear + i, 0))
      );
      categories = years.map((yearStart) => format(yearStart, "yyyy"));
      salesData = Array(5).fill(0);
      revenueData = Array(5).fill(0);

      soldProducts.forEach((p) => {
        const saleDate = getValidSaleDate(p);
        if (saleDate) {
          const yearIndex = years.findIndex((yearStart) => {
            const yearEnd = endOfYear(yearStart);
            return isWithinInterval(saleDate, {
              start: yearStart,
              end: yearEnd,
            });
          });
          if (yearIndex !== -1) {
            salesData[yearIndex] += 1;
            revenueData[yearIndex] += p.price;
          }
        }
      });
    }

    return { categories, sales: salesData, revenue: revenueData };
  }, [products, loading, error, selectedTab, currentYear]);

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
      stroke: {
        curve: "smooth",
        width: [2.5, 2.5],
      },
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
          formatter: function (val, { dataPointIndex, w }) {
            return w.globals.labels[dataPointIndex] || val;
          },
        },
        y: [
          {
            title: { formatter: (seriesName) => seriesName + ": " },
            formatter: (val) => `${val ? val.toLocaleString("id-ID") : 0} unit`,
          },
          {
            title: { formatter: (seriesName) => seriesName + ": " },
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
          formatter: function (val) {
            if (
              typeof val === "string" &&
              val.length > 7 &&
              selectedTab === "Minggu"
            ) {
              return val.substring(0, 6) + ".";
            }
            return val;
          },
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
              if (num >= 1000000000) {
                const result = num / 1000000000;
                return `Rp ${result.toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: result % 1 === 0 ? 0 : 1,
                })}M`;
              }
              if (num >= 1000000) {
                const result = num / 1000000;
                return `Rp ${result.toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}Jt`;
              }
              if (num >= 1000) {
                const result = num / 1000;
                return `Rp ${result.toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}K`;
              }
              return `Rp ${num.toLocaleString("id-ID", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`;
            },
          },
          min: 0,
        },
      ],
    }),
    [processedChartData, selectedTab]
  );

  const chartSeries = [
    { name: "Unit Terjual", data: processedChartData.sales },
    { name: "Pendapatan", data: processedChartData.revenue },
  ];

  const hasActualData =
    processedChartData.sales.some((v) => v > 0) ||
    processedChartData.revenue.some((v) => v > 0);

  const chartContainerRef = useAutoScrollToChart(
    { sales: processedChartData.sales, revenue: processedChartData.revenue },
    selectedTab,
    currentYear
  );

  if (loading) {
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
          <Loader2 className="animate-spin mr-2" />
          <span className="animate-pulse">Sedang memuat data...</span>
        </div>
      </div>
    );
  }

  if (error) {
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
          Gagal memuat data statistik. Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white px-4 pb-5 pt-5 sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-2 md:gap-5 mb-2 md:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            {selectedTab === "Minggu" &&
              "Statistik Penjualan Minggu 12 Minggu Terakhir"}
            {selectedTab === "Bulan" &&
              `Statistik Penjualan Bulan (${currentYear})`}
            {selectedTab === "Tahun" &&
              "Statistik Penjualan Tahun 5 Tahun Terakhir"}
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
      </div>

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
    </div>
  );
};

export default SalesStatsChart;
