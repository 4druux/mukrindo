"use client";
import React, { useMemo, useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useProducts } from "@/context/ProductContext";
import { FaEllipsis } from "react-icons/fa6";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const CHART_COLORS = ["#F89B78", "#B6A6E9", "#AFDC8F", "#9AD8D8", "#92C5F9"];

const TopViewedCarsChart = () => {
  const { products, loading, error } = useProducts();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const chartRef = useRef(null);
  const [allStats, setAllStats] = useState({
    totalAllViews: 0,
    averageAllViews: 0,
    allProductsWithViews: [],
  });

  // Calculate statistics for all products
  const calculateAllProductsStats = () => {
    if (!products || products.length === 0) {
      return {
        totalAllViews: 0,
        averageAllViews: 0,
        allProductsWithViews: [],
      };
    }

    const allProductsWithViews = products.filter(
      (p) => typeof p.viewCount === "number"
    );
    const totalAllViews = allProductsWithViews.reduce(
      (sum, p) => sum + (p.viewCount || 0),
      0
    );
    const averageAllViews =
      allProductsWithViews.length > 0
        ? totalAllViews / allProductsWithViews.length
        : 0;

    return {
      totalAllViews,
      averageAllViews,
      allProductsWithViews: allProductsWithViews.sort(
        (a, b) => b.viewCount - a.viewCount
      ),
    };
  };

  // Calculate chart data for top 5 products
  const chartData = useMemo(() => {
    if (!products || products.length === 0) {
      return {
        series: [],
        labels: [],
        topProducts: [],
        hasData: false,
      };
    }

    const productsWithViews = products
      .filter((p) => typeof p.viewCount === "number" && p.viewCount > 0)
      .sort((a, b) => b.viewCount - a.viewCount);

    const topProducts = productsWithViews.slice(0, 5);

    if (topProducts.length === 0) {
      return {
        series: [],
        labels: [],
        topProducts: [],
        hasData: false,
      };
    }

    const series = topProducts.map((p) => p.viewCount);
    const labels = topProducts.map(
      (p) =>
        p.carName ||
        `${p.brand || ""} ${p.model || ""} ${p.variant || ""}`.trim() ||
        `Produk ID: ${p._id}`
    );

    return {
      series,
      labels,
      topProducts,
      hasData: true,
    };
  }, [products]);

  // Chart options
  const chartOptions = useMemo(
    () => ({
      chart: {
        type: "pie",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
        },
        toolbar: {
          show: false,
        },
        events: {
          mounted: (chart) => {
            chartRef.current = chart;
          },
          updated: (chart) => {
            chartRef.current = chart;
          },
        },
      },
      labels: chartData.labels,
      colors: CHART_COLORS.slice(0, chartData.topProducts.length),
      legend: {
        show: false,
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (val) => `${val.toLocaleString("id-ID")} dilihat`,
        },
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          const label = w.globals.labels[seriesIndex];
          const value = series[seriesIndex];
          const percentage = (
            (value / w.globals.seriesTotals.reduce((a, b) => a + b, 0)) *
            100
          ).toFixed(1);
          const color = w.globals.colors[seriesIndex];

          return `
            <div class="apexcharts-tooltip-custom" style="padding: 8px 12px; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                    <span style="width: 12px; height: 12px; border-radius: 50%; background-color: ${color}; margin-right: 8px;"></span>
                    <strong style="font-size: 13px; color: #333;">${label}</strong>
                </div>
                <div style="font-size: 12px; color: #555;">
                    Dilihat: ${value.toLocaleString("id-ID")} (${percentage}%)
                </div>
            </div>
          `;
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return `${val.toFixed(1)}%`;
        },
        style: {
          fontSize: "12px",
          fontFamily: "Outfit, sans-serif",
          fontWeight: "bold",
          colors: ["#fff"],
        },
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 1,
          color: "#000000",
          opacity: 0.7,
        },
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          dataLabels: {
            offset: -15,
            minAngleToShowLabel: 10,
          },
        },
      },
      states: {
        hover: {
          filter: {
            type: "none",
          },
        },
        active: {
          filter: {
            type: "none",
          },
        },
      },
      stroke: {
        show: true,
        width: 1.5,
        colors: ["#fff"],
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              width: "100%",
            },
            dataLabels: {
              style: {
                fontSize: "10px",
              },
              formatter: function (val) {
                return `${val.toFixed(1)}%`;
              },
            },
          },
        },
      ],
    }),
    [chartData.labels, chartData.topProducts.length]
  );

  // Handle export functionality
  const handleExport = (type) => {
    if (type === "CSV") {
      const headers = [
        "No",
        "Nama Mobil",
        "Merk",
        "Model",
        "Varian",
        "Jumlah Dilihat",
      ];
      const csvContent = [
        headers.join(","),
        ...allStats.allProductsWithViews.map((product, index) =>
          [
            index + 1,
            `"${product.carName || "-"}"`,
            `"${product.brand || "-"}"`,
            `"${product.model || "-"}"`,
            `"${product.variant || "-"}"`,
            product.viewCount,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data_mobil_dilihat.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (type === "PDF") {
      import("jspdf").then((jsPDF) => {
        import("jspdf-autotable").then((autoTable) => {
          const doc = new jsPDF.default();

          // Title
          doc.setFontSize(16);
          doc.text("Laporan Data Mobil Dilihat", 14, 20);

          // Subtitle
          doc.setFontSize(10);
          doc.text(
            `Total Data: ${allStats.allProductsWithViews.length} mobil`,
            14,
            30
          );
          doc.text(
            `Total Views: ${allStats.totalAllViews.toLocaleString("id-ID")}`,
            14,
            36
          );
          doc.text(
            `Rata-rata: ${allStats.averageAllViews.toFixed(2)} views/mobil`,
            14,
            42
          );

          // Table data
          autoTable.default(doc, {
            startY: 50,
            head: [["No", "Nama Mobil", "Merk", "Model", "Varian", "Views"]],
            body: allStats.allProductsWithViews.map((product, index) => [
              index + 1,
              product.carName || "-",
              product.brand || "-",
              product.model || "-",
              product.variant || "-",
              product.viewCount.toLocaleString("id-ID"),
            ]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [79, 70, 229] },
          });

          doc.save("data_mobil_dilihat.pdf");
        });
      });
    }

    setShowExportMenu(false);
  };

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest(".export-menu-container")) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showExportMenu]);

  // Update all products stats when products change
  useEffect(() => {
    if (products) {
      setAllStats(calculateAllProductsStats());
    }
  }, [products]);

  if (loading) {
    return (
      <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white p-6 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div
          className="flex justify-center items-center"
          style={{ minHeight: "300px" }}
        >
          <div className="w-48 h-48 bg-gray-300 rounded-full"></div>
        </div>
        <div className="mt-4 space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 rounded w-1/2"></div>
          ))}
        </div>
        <div className="mt-4 h-4 bg-gray-300 rounded w-1/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white p-6 text-red-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            Mobil Paling Diminati
          </h3>
        </div>
        Gagal memuat data produk.
      </div>
    );
  }

  if (!chartData.hasData) {
    return (
      <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            Mobil Paling Diminati
          </h3>
        </div>
        <p className="text-gray-500">Belum ada data produk yang dilihat.</p>
        <p className="text-sm text-gray-500 mt-4">
          Total melihat semua mobil: 0
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Rata-rata melihat semua mobil: 0
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md lg:text-lg font-medium text-gray-700">
          Mobil Paling Diminati
        </h3>
        <div className="relative export-menu-container">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="text-gray-500 hover:text-gray-700 p-2 cursor-pointer hover:bg-gray-100 rounded-full focus:outline-none"
            aria-label="Opsi Ekspor"
          >
            <FaEllipsis className="w-5 h-5" />
          </button>
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-max bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <ul className="text-xs font-medium text-gray-700">
                <li>
                  <button
                    onClick={() => handleExport("PDF")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Download PDF
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleExport("CSV")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Download CSV
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center">
        {typeof window !== "undefined" && (
          <ReactApexChart
            options={chartOptions}
            series={chartData.series}
            type="pie"
            width="100%"
            height={350}
          />
        )}
      </div>

      {/* Custom Legend */}
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-semibold text-gray-600 mb-2">
          Top 5 Mobil Paling Diminati
        </h4>
        {chartData.topProducts.map((product, index) => (
          <div key={product._id} className="flex items-center space-x-3">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
              }}
            ></span>
            <span
              className="text-xs text-gray-700 truncate flex-1"
              title={chartData.labels[index]}
            >
              {chartData.labels[index]}
            </span>
            <span className="text-xs font-semibold text-gray-800">
              {product.viewCount.toLocaleString("id-ID")}
            </span>
          </div>
        ))}
      </div>

      {/* All Products Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          Total melihat semua data mobil:{" "}
          <span className="font-semibold text-gray-800">
            {allStats.totalAllViews.toLocaleString("id-ID")}
          </span>
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Rata-rata melihat semua data mobil:{" "}
          <span className="font-semibold text-gray-800">
            {allStats.averageAllViews.toFixed(2).replace(".", ",")}
          </span>
        </p>
      </div>
    </div>
  );
};

export default TopViewedCarsChart;
