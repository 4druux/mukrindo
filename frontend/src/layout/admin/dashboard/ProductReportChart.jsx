"use client";
import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useProducts } from "@/context/ProductContext";
import { FaCar, FaBoxOpen } from "react-icons/fa";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachWeekOfInterval,
  isWithinInterval,
  parseISO,
  isValid,
  getYear,
} from "date-fns";
import { id } from "date-fns/locale";
import { useExportData } from "@/hooks/useExportData";
import ExportDropdown from "@/components/product-admin/Dashboard/ExportDropdown";
import PeriodFilter from "@/components/product-admin/Dashboard/PeriodFilter";
import { useAutoScrollToChart } from "@/hooks/useAutoScrollToChart";
import DotLoader from "@/components/common/DotLoader";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const getValidDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const dateObj = parseISO(dateStr);
    return isValid(dateObj) ? dateObj : new Date(dateStr);
  } catch {
    return null;
  }
};

const ProductReportChart = () => {
  const { products, loading, error } = useProducts();
  const [selectedTab, setSelectedTab] = useState("Minggu");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const prepareExportData = () => {
    const validProducts = products.filter((p) => getValidDate(p.createdAt));

    const hasDataForPeriod =
      processedData.masuk.some((v) => v > 0) ||
      processedData.terjual.some((v) => v > 0);

    if (validProducts.length === 0 || !hasDataForPeriod) {
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

    const pdfData = validProducts.map((product, index) => [
      index + 1,
      product.carName ||
        `${product.brand || ""} ${product.model || ""}`.trim() ||
        "N/A",
      `Rp ${product.price?.toLocaleString("id-ID") || "0"}`,
      getValidDate(product.createdAt)
        ? format(getValidDate(product.createdAt), "dd MMM yyyy", { locale: id })
        : "-",
      product.status?.toLowerCase() === "terjual" &&
      getValidDate(product.soldDate || product.updatedAt)
        ? format(
            getValidDate(product.soldDate || product.updatedAt),
            "dd MMM yyyy",
            { locale: id }
          )
        : "-",
      product.status || "N/A",
    ]);

    const csvData = validProducts.map((product, index) => [
      index + 1,
      `"${
        product.carName ||
        `${product.brand || ""} ${product.model || ""}`.trim() ||
        "N/A"
      }"`,
      product.price || 0,
      getValidDate(product.createdAt)
        ? format(getValidDate(product.createdAt), "yyyy-MM-dd")
        : "-",
      product.status?.toLowerCase() === "terjual" &&
      getValidDate(product.soldDate || product.updatedAt)
        ? format(
            getValidDate(product.soldDate || product.updatedAt),
            "yyyy-MM-dd"
          )
        : "-",
      product.status || "N/A",
    ]);

    const totalMasuk = validProducts.length;
    const totalTerjual = validProducts.filter(
      (p) => p.status?.toLowerCase() === "terjual"
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
          ["Total Produk Masuk:", totalMasuk.toLocaleString("id-ID")],
          ["Total Produk Terjual:", totalTerjual.toLocaleString("id-ID")],
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

  const processedData = useMemo(() => {
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
        masuk: Array(defaultCategories.length).fill(0),
        terjual: Array(defaultCategories.length).fill(0),
      };
    };

    if (loading || error || !products || products.length === 0) {
      return createDefaultData();
    }

    const validProducts = products.filter((p) => getValidDate(p.createdAt));
    if (validProducts.length === 0) {
      return createDefaultData();
    }

    let categories = [];
    let masukData = [];
    let terjualData = [];

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
      masukData = Array(weeks.length).fill(0);
      terjualData = Array(weeks.length).fill(0);

      validProducts.forEach((product) => {
        const entryDate = getValidDate(product.createdAt);
        if (entryDate) {
          const weekIndex = weeks.findIndex((weekStart) => {
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
            return isWithinInterval(entryDate, {
              start: weekStart,
              end: weekEnd,
            });
          });
          if (weekIndex !== -1) masukData[weekIndex] += 1;
        }

        if (product.status?.toLowerCase() === "terjual") {
          const saleDate = getValidDate(product.soldDate || product.updatedAt);
          if (saleDate) {
            const weekIndex = weeks.findIndex((weekStart) => {
              const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
              return isWithinInterval(saleDate, {
                start: weekStart,
                end: weekEnd,
              });
            });
            if (weekIndex !== -1) terjualData[weekIndex] += 1;
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
      masukData = Array(12).fill(0);
      terjualData = Array(12).fill(0);

      validProducts.forEach((product) => {
        const entryDate = getValidDate(product.createdAt);
        if (entryDate && getYear(entryDate) === currentYear) {
          masukData[entryDate.getMonth()] += 1;
        }

        if (product.status?.toLowerCase() === "terjual") {
          const saleDate = getValidDate(product.soldDate || product.updatedAt);
          if (saleDate && getYear(saleDate) === currentYear) {
            terjualData[saleDate.getMonth()] += 1;
          }
        }
      });
    } else if (selectedTab === "Tahun") {
      const endYear = getYear(new Date());
      const startYear = endYear - 4;
      const years = Array.from({ length: 5 }, (_, i) =>
        startOfYear(new Date(startYear + i, 0))
      );
      categories = years.map((yearStart) => format(yearStart, "yyyy"));
      masukData = Array(5).fill(0);
      terjualData = Array(5).fill(0);

      validProducts.forEach((product) => {
        const entryDate = getValidDate(product.createdAt);
        if (entryDate) {
          const yearIndex = years.findIndex((yearStart) => {
            const yearEnd = endOfYear(yearStart);
            return isWithinInterval(entryDate, {
              start: yearStart,
              end: yearEnd,
            });
          });
          if (yearIndex !== -1) masukData[yearIndex] += 1;
        }

        if (product.status?.toLowerCase() === "terjual") {
          const saleDate = getValidDate(product.soldDate || product.updatedAt);
          if (saleDate) {
            const yearIndex = years.findIndex((yearStart) => {
              const yearEnd = endOfYear(yearStart);
              return isWithinInterval(saleDate, {
                start: yearStart,
                end: yearEnd,
              });
            });
            if (yearIndex !== -1) terjualData[yearIndex] += 1;
          }
        }
      });
    }

    return { categories, masuk: masukData, terjual: terjualData };
  }, [products, loading, error, selectedTab, currentYear]);

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
            selectedTab === "Minggu" && val.length > 7
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

  const hasActualData =
    processedData.masuk.some((v) => v > 0) ||
    processedData.terjual.some((v) => v > 0);
  const totalMasuk = processedData.masuk.reduce((a, b) => a + b, 0);
  const totalTerjual = processedData.terjual.reduce((a, b) => a + b, 0);

  const chartContainerRef = useAutoScrollToChart(
    { masuk: processedData.masuk, terjual: processedData.terjual },
    selectedTab,
    currentYear
  );

  if (loading) {
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

  if (error) {
    return (
      <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-2 md:gap-5 mb-2 md:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full">
            <h3 className="text-md lg:text-lg font-medium text-gray-700">
              Laporan Produk Mobil
            </h3>
          </div>
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
          Gagal memuat data produk. Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white p-4 sm:p-6">
      <div className="flex flex-col gap-2 md:gap-5 mb-2 md:mb-6 sm:flex-row sm:items-center sm:justify-between">
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
      </div>

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

      <div className="mt-4 md:mt-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-start">
        <div className="flex items-start gap-3 p-2 border border-gray-200 rounded-lg bg-gray-50 flex-1 min-w-[200px]">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
            <FaCar className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600">
              Total Produk Masuk
            </h4>
            <p className="text-lg font-semibold text-gray-600">
              {totalMasuk.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-2 border border-gray-200 rounded-lg bg-gray-50 flex-1 min-w-[200px]">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-teal-100 rounded-lg">
            <FaBoxOpen className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600">
              Total Produk Terjual
            </h4>
            <p className="text-lg font-semibold text-gray-600">
              {totalTerjual.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReportChart;
