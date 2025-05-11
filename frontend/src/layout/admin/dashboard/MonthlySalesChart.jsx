"use client";
import dynamic from "next/dynamic";
import React, { useMemo } from "react";
import { useProducts } from "@/context/ProductContext";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlySalesChart() {
  const { products, loading, error } = useProducts();

  const monthlySalesData = useMemo(() => {
    const salesByMonth = Array(12).fill(0);

    if (loading || error || !products || products.length === 0) {
      return salesByMonth;
    }

    products.forEach((product) => {
      if (product.status?.toLowerCase() === "terjual") {
        let saleDateStr = product.soldDate || product.updatedAt;

        if (saleDateStr) {
          try {
            const saleDateObj = new Date(saleDateStr);
            if (!isNaN(saleDateObj.getTime())) {
              const month = saleDateObj.getMonth();
              salesByMonth[month] += 1; // Menghitung jumlah unit terjual
            }
          } catch (e) {
            // Abaikan jika tanggal tidak bisa diproses
          }
        }
      }
    });
    return salesByMonth;
  }, [products, loading, error]);

  const options = {
    colors: ["#f97316"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 220,
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
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 6,
        borderRadiusApplication: "end",
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: false,
      offsetY: -20,
      style: { fontSize: "10px", colors: ["#304758"] },
    },
    states: {
      active: {
        filter: {
          type: "none",
        },
      },
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#6b7280", fontSize: "11px" } },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit, sans-serif",
      fontWeight: 500,
      fontSize: "13px",
      labels: { colors: "#374151" },
      markers: { width: 10, height: 10, radius: 5, fillColors: ["#f97316"] },
      itemMargin: { horizontal: 10 },
    },
    yaxis: {
      title: { text: undefined },
      labels: {
        style: { colors: "#6b7280", fontSize: "11px" },
        formatter: (val) => val.toFixed(0),
      },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    fill: { opacity: 1 },
    tooltip: {
      theme: "light",
      y: { formatter: (val) => `${val.toLocaleString("id-ID")} unit terjual` },
      marker: { show: true },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: { height: 200 },
          plotOptions: { bar: { columnWidth: "60%" } },
          xaxis: { labels: { style: { fontSize: "10px" } } },
          yaxis: { labels: { style: { fontSize: "10px" } } },
          legend: { fontSize: "12px" },
        },
      },
    ],
  };

  const series = [
    {
      name: "Unit Terjual",
      data: monthlySalesData,
    },
  ];

  const chartHeight = options.chart.height;

  if (loading) {
    return (
      <div className="overflow-hidden border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            Laporan Penjualan Bulanan
          </h3>
        </div>
        <div
          className="animate-pulse mt-4"
          style={{ height: `${chartHeight}px` }}
        >
          <div className="h-full bg-gray-200 rounded-md"></div>
        </div>
        <div className="text-center py-2 text-sm text-gray-500">
          Memuat data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            Laporan Penjualan Bulanan
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
          Gagal memuat data penjualan.
        </div>
      </div>
    );
  }

  const hasSalesData = monthlySalesData.some((count) => count > 0);

  return (
    <div className="overflow-hidden border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md lg:text-lg font-medium text-gray-700">
          Laporan Penjualan Bulanan
        </h3>
      </div>
      {hasSalesData ? (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="pl-0">
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
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
          Tidak ada data penjualan untuk ditampilkan pada periode ini.
        </div>
      )}
    </div>
  );
}
