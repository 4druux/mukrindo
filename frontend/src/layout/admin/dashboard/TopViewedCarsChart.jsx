"use client";
import React, { useMemo, useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useProducts } from "@/context/ProductContext";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useExportData } from "@/hooks/useExportData";
import ExportDropdown from "@/components/product-admin/Dashboard/ExportDropdown";
import DotLoader from "@/components/common/DotLoader";
import { motion, animate, useInView } from "framer-motion";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const CHART_COLORS = ["#F89B78", "#B6A6E9", "#AFDC8F", "#9AD8D8", "#92C5F9"];

// Helper animasi angka
function AnimatedNumber({ value, isInteger = true }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;
    const node = ref.current;
    if (!node) return;
    const controls = animate(0, value, {
      duration: 4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        if (isInteger)
          node.textContent = Math.round(latest).toLocaleString("id-ID");
        else node.textContent = latest.toFixed(2).replace(".", ",");
      },
    });
    return () => controls.stop();
  }, [value, isInteger, isInView]);

  return <span ref={ref} />;
}

const TopViewedCarsChart = () => {
  const { products, loading, error } = useProducts();
  const [allStats, setAllStats] = useState({
    totalAllViews: 0,
    averageAllViews: 0,
    allProductsWithViews: [],
  });
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const prepareExportData = () => {
    if (
      !allStats.allProductsWithViews ||
      allStats.allProductsWithViews.length === 0
    ) {
      return null;
    }

    const exportDate = format(new Date(), "dd MMM yyyy", { locale: id });
    const periodeText = `Data per: ${exportDate}`;
    const pdfData = allStats.allProductsWithViews.map((product, index) => [
      index + 1,
      product.carName || "-",
      product.brand || "-",
      product.model || "-",
      product.variant || "-",
      product.viewCount.toLocaleString("id-ID"),
    ]);
    const csvData = allStats.allProductsWithViews.map((product, index) => [
      index + 1,
      `"${product.carName || "-"}"`,
      `"${product.brand || "-"}"`,
      `"${product.model || "-"}"`,
      `"${product.variant || "-"}"`,
      product.viewCount,
    ]);

    return {
      pdf: {
        title: "Laporan Mobil Paling Dilihat",
        data: pdfData,
        columns: [
          "No",
          "Nama Mobil",
          "Merk",
          "Model",
          "Varian",
          "Jumlah Dilihat",
        ],
        summaryData: [
          [
            "Total Data Mobil Dilihat:",
            allStats.allProductsWithViews.length.toLocaleString("id-ID"),
          ],
          [
            "Total Views Keseluruhan:",
            allStats.totalAllViews.toLocaleString("id-ID"),
          ],
          [
            "Rata-rata Views per Mobil:",
            allStats.averageAllViews.toFixed(2).replace(".", ","),
          ],
        ],
        fileName: "Laporan_Mobil_Paling_Dilihat_Mukrindo.pdf",
        periodeText,
      },
      csv: {
        headers: [
          "No",
          "Nama Mobil",
          "Merk",
          "Model",
          "Varian",
          "Jumlah Dilihat",
        ],
        data: csvData,
        fileName: "Laporan_Mobil_Paling_Dilihat_Mukrindo.csv",
      },
    };
  };

  const { handleExport } = useExportData(prepareExportData);

  const calculateAllProductsStats = () => {
    if (!products || products.length === 0) {
      return { totalAllViews: 0, averageAllViews: 0, allProductsWithViews: [] };
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

  const chartData = useMemo(() => {
    if (!products || products.length === 0) {
      return { series: [], labels: [], topProducts: [], hasData: false };
    }
    const productsWithViews = products
      .filter((p) => typeof p.viewCount === "number" && p.viewCount > 0)
      .sort((a, b) => b.viewCount - a.viewCount);
    const topProducts = productsWithViews.slice(0, 5);
    if (topProducts.length === 0) {
      return { series: [], labels: [], topProducts: [], hasData: false };
    }
    return {
      series: topProducts.map((p) => p.viewCount),
      labels: topProducts.map(
        (p) =>
          p.carName ||
          `${p.brand || ""} ${p.model || ""} ${p.variant || ""}`.trim() ||
          `Produk ID: ${p._id}`
      ),
      topProducts,
      hasData: true,
    };
  }, [products]);

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: "pie",
        animations: { enabled: true, easing: "easeinout", speed: 800 },
        toolbar: { show: false },
      },
      labels: chartData.labels,
      colors: CHART_COLORS.slice(0, chartData.topProducts.length),
      legend: { show: false },
      tooltip: {
        enabled: true,
        y: { formatter: (val) => `${val.toLocaleString("id-ID")} dilihat` },
        custom: ({ series, seriesIndex, w }) => {
          const label = w.globals.labels[seriesIndex];
          const value = series[seriesIndex];
          const percentage = (
            (value / w.globals.seriesTotals.reduce((a, b) => a + b, 0)) *
            100
          ).toFixed(1);
          const color = w.globals.colors[seriesIndex];
          return `<div class="apexcharts-tooltip-custom" style="padding: 8px 12px; background: #fff; border: 1px solid #e0e0e0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><div style="display: flex; align-items: center; margin-bottom: 4px;"><span style="width: 12px; height: 12px; border-radius: 50%; background-color: ${color}; margin-right: 8px;"></span><strong style="font-size: 13px; color: #333;">${label}</strong></div><div style="font-size: 12px; color: #555;">Dilihat: ${value.toLocaleString(
            "id-ID"
          )} (${percentage}%)</div></div>`;
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(1)}%`,
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
          dataLabels: { offset: -15, minAngleToShowLabel: 10 },
        },
      },
      states: {
        hover: { filter: { type: "none" } },
        active: { filter: { type: "none" } },
      },
      stroke: { show: true, width: 1.5, colors: ["#fff"] },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: { width: "100%" },
            dataLabels: {
              style: { fontSize: "10px" },
              formatter: (val) => `${val.toFixed(1)}%`,
            },
          },
        },
      ],
    }),
    [chartData.labels, chartData.topProducts.length]
  );

  useEffect(() => {
    if (products) {
      setAllStats(calculateAllProductsStats());
    }
  }, [products]);

  const listContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 150, damping: 20 },
    },
  };

  if (loading) {
    return (
      <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md lg:text-lg font-medium text-gray-700 animate-pulse">
            Memuat Mobil Paling Diminati...
          </h3>
        </div>
        <div
          className="flex flex-col gap-3 justify-center items-center w-full h-full text-gray-500"
          style={{ height: 435 }}
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

  if (error || !chartData.hasData) {
    const title = "Mobil Paling Diminati";
    const message = error
      ? "Gagal memuat data produk."
      : "Belum ada data produk yang dilihat.";
    return (
      <div
        className={`border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white p-6 ${
          error ? "text-red-500" : "text-gray-500"
        }`}
      >
        <h3 className="text-md lg:text-lg font-medium text-gray-700 mb-4">
          {title}
        </h3>
        <div
          className="text-center"
          style={{
            height: 435,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white p-4 sm:p-6"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { duration: 0.5, ease: "easeOut" },
        },
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md lg:text-lg font-medium text-gray-700">
          Mobil Paling Diminati
        </h3>
        <ExportDropdown onExport={handleExport} className="relative" />
      </div>

      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {typeof window !== "undefined" && (
          <ReactApexChart
            options={chartOptions}
            series={chartData.series}
            type="pie"
            width="100%"
            height={350}
          />
        )}
      </motion.div>

      <motion.div
        className="mt-6 space-y-2"
        variants={listContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <h4 className="text-sm font-semibold text-gray-600 mb-2">
          Top 5 Mobil Paling Diminati
        </h4>
        {chartData.topProducts.map((product, index) => (
          <motion.div
            key={product._id}
            className="flex items-center space-x-3"
            variants={listItemVariants}
          >
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
              <AnimatedNumber value={product.viewCount} />
            </span>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          Total melihat semua data mobil:{" "}
          <span className="font-semibold text-gray-800">
            <AnimatedNumber value={allStats.totalAllViews} />
          </span>
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Rata-rata melihat semua data mobil:{" "}
          <span className="font-semibold text-gray-800">
            <AnimatedNumber
              value={allStats.averageAllViews}
              isInteger={false}
            />
          </span>
        </p>
      </div>
    </motion.div>
  );
};

export default TopViewedCarsChart;
