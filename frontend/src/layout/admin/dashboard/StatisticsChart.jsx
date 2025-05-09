// src/components/admin/dashboard/StatisticsChart.jsx
"use client";
import React, { useState, useMemo, useEffect } from "react";
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
  eachMonthOfInterval,
  eachYearOfInterval,
  getYear,
  getMonth,
  isWithinInterval,
  parseISO,
  isValid,
} from "date-fns";
import { id } from "date-fns/locale";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const getValidSaleDate = (product) => {
  const dateStr = product.soldDate || product.updatedAt;
  if (!dateStr) return null;
  try {
    // Coba parse sebagai ISO string dulu, karena itu format yang paling umum dari backend
    let dateObj = parseISO(dateStr);
    if (isValid(dateObj)) return dateObj;

    // Jika parseISO gagal, coba new Date() sebagai fallback (kurang reliable untuk format non-standar)
    dateObj = new Date(dateStr);
    return isValid(dateObj) ? dateObj : null;
  } catch (error) {
    return null; // Jika ada error saat parsing
  }
};

export default function StatisticsChart() {
  const { products, loading, error } = useProducts();
  const [selectedTab, setSelectedTab] = useState("Mingguan");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const processedChartData = useMemo(() => {
    if (loading || error || !products || products.length === 0) {
      return { categories: [], sales: [], revenue: [] };
    }

    const soldProducts = products.filter((p) => {
      const saleDate = getValidSaleDate(p);
      return (
        p.status?.toLowerCase() === "terjual" &&
        typeof p.price === "number" &&
        p.price > 0 && // Pastikan harga valid
        saleDate // Pastikan ada tanggal penjualan yang valid
      );
    });

    if (soldProducts.length === 0) {
      // Jika tidak ada produk terjual, siapkan kategori default agar chart tidak kosong total
      let defaultCategories = [];
      if (selectedTab === "Mingguan") {
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
      } else if (selectedTab === "Bulanan") {
        defaultCategories = Array.from({ length: 12 }, (_, i) =>
          format(startOfMonth(new Date(currentYear, i)), "MMM yyyy", {
            locale: id,
          })
        );
      } else if (selectedTab === "Tahunan") {
        defaultCategories = Array.from({ length: 5 }, (_, i) =>
          format(
            startOfYear(new Date(new Date().getFullYear() - (4 - i), 0)),
            "yyyy"
          )
        );
      }
      return {
        categories: defaultCategories,
        sales: Array(defaultCategories.length).fill(0),
        revenue: Array(defaultCategories.length).fill(0),
      };
    }

    const saleDates = soldProducts
      .map((p) => getValidSaleDate(p))
      .filter(Boolean);
    const minDate =
      saleDates.length > 0
        ? new Date(Math.min(...saleDates.map((date) => date.getTime())))
        : startOfYear(new Date());
    const maxDate =
      saleDates.length > 0
        ? new Date(Math.max(...saleDates.map((date) => date.getTime())))
        : endOfYear(new Date());

    let categories = [];
    let salesData = [];
    let revenueData = [];

    if (selectedTab === "Mingguan") {
      const endDateForWeeks = endOfWeek(new Date(), { weekStartsOn: 1 }); // Minggu ini sebagai akhir
      const startDateForWeeks = startOfWeek(
        new Date(
          endDateForWeeks.getFullYear(),
          endDateForWeeks.getMonth(),
          endDateForWeeks.getDate() - 12 * 7 + 1
        ),
        { weekStartsOn: 1 }
      ); // 12 minggu lalu

      const relevantWeeks = eachWeekOfInterval(
        { start: startDateForWeeks, end: endDateForWeeks },
        { weekStartsOn: 1 }
      );

      categories = relevantWeeks.map((weekStart) =>
        format(weekStart, "dd MMM", { locale: id })
      );

      relevantWeeks.forEach((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        let weeklySales = 0;
        let weeklyRevenue = 0;
        soldProducts.forEach((p) => {
          const saleDate = getValidSaleDate(p);
          if (
            saleDate &&
            isWithinInterval(saleDate, { start: weekStart, end: weekEnd })
          ) {
            weeklySales += 1;
            weeklyRevenue += p.price;
          }
        });
        salesData.push(weeklySales);
        revenueData.push(weeklyRevenue);
      });
    } else if (selectedTab === "Bulanan") {
      const monthsOfYear = Array.from({ length: 12 }, (_, i) =>
        startOfMonth(new Date(currentYear, i))
      );
      categories = monthsOfYear.map((monthStart) =>
        format(monthStart, "MMM yyyy", { locale: id })
      );

      monthsOfYear.forEach((monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        let monthlySales = 0;
        let monthlyRevenue = 0;
        soldProducts.forEach((p) => {
          const saleDate = getValidSaleDate(p);
          if (
            saleDate &&
            getYear(saleDate) === currentYear &&
            getMonth(saleDate) === getMonth(monthStart)
          ) {
            monthlySales += 1;
            monthlyRevenue += p.price;
          }
        });
        salesData.push(monthlySales);
        revenueData.push(monthlyRevenue);
      });
    } else if (selectedTab === "Tahunan") {
      const endYearForRange = getYear(new Date());
      const startYearForRange = endYearForRange - 4; // 5 tahun terakhir termasuk tahun ini
      const relevantYears = Array.from({ length: 5 }, (_, i) =>
        startOfYear(new Date(startYearForRange + i, 0))
      );

      categories = relevantYears.map((yearStart) => format(yearStart, "yyyy"));

      relevantYears.forEach((yearStart) => {
        const yearEnd = endOfYear(yearStart);
        let yearlySales = 0;
        let yearlyRevenue = 0;
        soldProducts.forEach((p) => {
          const saleDate = getValidSaleDate(p);
          if (
            saleDate &&
            isWithinInterval(saleDate, { start: yearStart, end: yearEnd })
          ) {
            yearlySales += 1;
            yearlyRevenue += p.price;
          }
        });
        salesData.push(yearlySales);
        revenueData.push(yearlyRevenue);
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
        width: [2.5, 2.5], // Ketebalan garis
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.3,
          opacityFrom: 0.7, // Opacity awal gradien (lebih solid di atas)
          opacityTo: 0.1, // Opacity akhir gradien (lebih transparan di bawah)
          stops: [0, 95, 100], // Gradien lebih solid hingga 95% lalu fade out
        },
      },
      markers: {
        size: 0,
        strokeColors: ["#f97316", "#06b6d4"],
        strokeWidth: 3, // Lebar stroke marker saat hover
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
              selectedTab === "Mingguan"
            ) {
              return val.substring(0, 6) + "."; // Potong label mingguan jika terlalu panjang
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
              if (val == null || isNaN(parseFloat(val))) return "Rp 0"; // Handle null, undefined, atau NaN

              const num = parseFloat(val);

              if (num >= 1000000000) {
                // Miliar
                // Bagi dengan 1 Miliar, format ke 1 atau 2 desimal jika perlu
                const result = num / 1000000000;
                return `Rp ${result.toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: result % 1 === 0 ? 0 : 1,
                })}M`;
              }
              if (num >= 1000000) {
                // Juta
                // Bagi dengan 1 Juta, format ke 0 desimal
                const result = num / 1000000;
                return `Rp ${result.toLocaleString("id-ID", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}Jt`;
              }
              if (num >= 1000) {
                // Ribu
                // Bagi dengan 1 Ribu, format ke 0 desimal
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

  const chartSeries = useMemo(
    () => [
      {
        name: "Unit Terjual",
        data: processedChartData.sales,
      },
      {
        name: "Pendapatan",
        data: processedChartData.revenue,
      },
    ],
    [processedChartData]
  );

  const chartHeight = chartOptions.chart.height;

  if (loading) {
    return (
      <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white px-4 pb-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            Memuat Statistik...
          </h3>
        </div>
        <div className="animate-pulse" style={{ height: `${chartHeight}px` }}>
          <div className="h-full bg-gray-200 rounded-md"></div>
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
            height: `${chartHeight}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Gagal memuat data statistik.
        </div>
      </div>
    );
  }

  const hasActualData =
    processedChartData.sales.some((s) => s > 0) ||
    processedChartData.revenue.some((r) => r > 0);

  return (
    <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white px-4 pb-5 pt-5 sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-2 md:gap-5 mb-2 md:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            {selectedTab === "Mingguan" &&
              "Statistik Penjualan Mingguan (12 Minggu Terakhir)"}
            {selectedTab === "Bulanan" &&
              `Statistik Penjualan Bulanan (${currentYear})`}
            {selectedTab === "Tahunan" &&
              "Statistik Penjualan Tahunan (5 Tahun Terakhir)"}
          </h3>
        </div>
        <div className="flex items-center flex-wrap gap-2 sm:w-auto sm:justify-end">
          {selectedTab === "Bulanan" && (
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              className="px-3 py-1.5 text-xs rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 bg-white text-gray-700 order-first sm:order-none"
            >
              {Array.from(
                { length: 6 },
                (_, i) => new Date().getFullYear() - 5 + i + 1
              )
                .sort((a, b) => b - a)
                .map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </select>
          )}
          <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-1 w-full sm:w-auto">
            {["Mingguan", "Bulanan", "Tahunan"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-3 py-1.5 font-semibold w-full rounded-md text-xs cursor-pointer transition-colors duration-150 ${
                  selectedTab === tab
                    ? "text-orange-600 bg-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>
      {hasActualData ? (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
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
          Tidak ada data penjualan untuk periode ini.
        </div>
      )}
    </div>
  );
}
