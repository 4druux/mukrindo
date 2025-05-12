"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useProducts } from "@/context/ProductContext";
import { FaEllipsis } from "react-icons/fa6";
import { FaCar, FaBoxOpen, FaChevronDown } from "react-icons/fa";
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
  isWithinInterval,
  parseISO,
  isValid,
  getYear,
} from "date-fns";
import { id } from "date-fns/locale";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const getValidDate = (dateStr) => {
  // ... (fungsi getValidDate tetap sama)
  if (!dateStr) return null;
  try {
    let dateObj = parseISO(dateStr);
    if (isValid(dateObj)) return dateObj;

    dateObj = new Date(dateStr);
    return isValid(dateObj) ? dateObj : null;
  } catch (error) {
    return null;
  }
};

export default function GeneralProductReport() {
  const { products, loading, error } = useProducts();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Mingguan");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const yearDropdownRef = useRef(null);

  const availableYears = useMemo(() => {
    // ... (logika availableYears tetap sama)
    const current = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => current - 5 + i + 1).sort(
      (a, b) => b - a
    );
  }, []);

  useEffect(() => {
    // ... (logika handleClickOutside untuk dropdown tahun tetap sama)
    function handleClickOutside(event) {
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target)
      ) {
        setIsYearDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [yearDropdownRef]);

  const processedData = useMemo(() => {
    // ... (logika processedData tetap sama)
    if (loading || error || !products || products.length === 0) {
      return { categories: [], masuk: [], terjual: [] };
    }

    const soldProducts = products.filter(
      (p) => p.status?.toLowerCase() === "terjual"
    );

    const createDefaultData = () => {
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
          (new Date().getFullYear() - 4 + i).toString()
        );
      }
      return {
        categories: defaultCategories,
        masuk: Array(defaultCategories.length).fill(0),
        terjual: Array(defaultCategories.length).fill(0),
      };
    };

    if (selectedTab === "Mingguan") {
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

      const categories = weeks.map((weekStart) =>
        format(weekStart, "dd MMM", { locale: id })
      );

      const masukData = Array(weeks.length).fill(0);
      const terjualData = Array(weeks.length).fill(0);

      products.forEach((product) => {
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

      return { categories, masuk: masukData, terjual: terjualData };
    } else if (selectedTab === "Bulanan") {
      const months = Array.from({ length: 12 }, (_, i) =>
        startOfMonth(new Date(currentYear, i))
      );

      const categories = months.map((monthStart) =>
        format(monthStart, "MMM yyyy", { locale: id })
      );

      const masukData = Array(12).fill(0);
      const terjualData = Array(12).fill(0);

      products.forEach((product) => {
        const entryDate = getValidDate(product.createdAt);
        if (entryDate && getYear(entryDate) === currentYear) {
          const monthIndex = entryDate.getMonth();
          masukData[monthIndex] += 1;
        }

        if (product.status?.toLowerCase() === "terjual") {
          const saleDate = getValidDate(product.soldDate || product.updatedAt);
          if (saleDate && getYear(saleDate) === currentYear) {
            const monthIndex = saleDate.getMonth();
            terjualData[monthIndex] += 1;
          }
        }
      });

      return { categories, masuk: masukData, terjual: terjualData };
    } else if (selectedTab === "Tahunan") {
      const years = Array.from({ length: 5 }, (_, i) =>
        startOfYear(new Date(new Date().getFullYear() - 4 + i, 0))
      );

      const categories = years.map((yearStart) => format(yearStart, "yyyy"));

      const masukData = Array(5).fill(0);
      const terjualData = Array(5).fill(0);

      products.forEach((product) => {
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

      return { categories, masuk: masukData, terjual: terjualData };
    }

    return createDefaultData();
  }, [products, loading, error, selectedTab, currentYear]);

  // Chart options
  const options = useMemo(
    () => ({
      // ... (chart options tetap sama)
      colors: ["#F4784A", "#9AD8D8"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "bar",
        height: 350, // Tetapkan tinggi chart di sini
        stacked: true,
        toolbar: { show: false },
        zoom: { enabled: false },
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
      states: {
        hover: { filter: { type: "none" } },
        active: { filter: { type: "none" } },
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 1, colors: ["#fff"] },
      xaxis: {
        categories: processedData.categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: "#6b7280", fontSize: "11px" },
          formatter: function (val) {
            if (selectedTab === "Mingguan" && val && val.length > 7) {
              return val.substring(0, 6) + ".";
            }
            return val;
          },
        },
      },
      yaxis: {
        title: { text: "Jumlah Produk" },
        labels: {
          style: { colors: "#6b7280", fontSize: "11px" },
          formatter: (val) => val.toFixed(0),
        },
      },
      grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
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

  // Ambil tinggi chart dari options
  const chartHeight = options.chart.height;

  // Cek apakah ada data aktual (lebih dari 0) di salah satu seri
  const hasActualData = useMemo(() => {
    return (
      processedData.masuk.some((v) => v > 0) ||
      processedData.terjual.some((v) => v > 0)
    );
  }, [processedData]);

  const handleExport = (type) => {
    // ... (logika handleExport tetap sama)
    const dataForExport = products.map((product) => ({
      id: product._id,
      nama: product.carName || `${product.brand} ${product.model}`.trim(),
      status: product.status,
      tanggalMasuk: product.createdAt,
      tanggalTerjual:
        product.status?.toLowerCase() === "terjual"
          ? product.soldDate || product.updatedAt
          : "-",
      harga: product.price || 0,
    }));

    if (type === "CSV") {
      const headers = [
        "ID",
        "Nama Mobil",
        "Status",
        "Tanggal Masuk",
        "Tanggal Terjual",
        "Harga",
      ];
      const csvContent = [
        headers.join(","),
        ...dataForExport.map((product) =>
          [
            product.id,
            `"${product.nama}"`,
            product.status,
            product.tanggalMasuk,
            product.tanggalTerjual,
            product.harga,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Laporan_Mobil_Mukrindo.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (type === "PDF") {
      import("jspdf").then((jsPDF) => {
        import("jspdf-autotable").then((autoTable) => {
          const doc = new jsPDF.default();
          doc.setFontSize(16);
          doc.text("Laporan Produk Mobil", 14, 20);
          doc.setFontSize(10);
          doc.text(`Total Produk: ${products.length}`, 14, 30);
          doc.text(
            `Total Masuk: ${processedData.masuk.reduce((a, b) => a + b, 0)}`,
            14,
            36
          );
          doc.text(
            `Total Terjual: ${processedData.terjual.reduce(
              (a, b) => a + b,
              0
            )}`,
            14,
            42
          );
          autoTable.default(doc, {
            startY: 50,
            head: [
              [
                "No",
                "Nama Mobil",
                "Status",
                "Tanggal Masuk",
                "Tanggal Terjual",
                "Harga",
              ],
            ],
            body: dataForExport.map((product, index) => [
              index + 1,
              product.nama,
              product.status,
              new Date(product.tanggalMasuk).toLocaleDateString("id-ID"),
              product.tanggalTerjual !== "-"
                ? new Date(product.tanggalTerjual).toLocaleDateString("id-ID")
                : "-",
              product.harga.toLocaleString("id-ID"),
            ]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [79, 70, 229] },
          });
          doc.save("Laporan_Mobil_Mukrindo.pdf");
        });
      });
    }
    setShowExportMenu(false);
  };

  useEffect(() => {
    // ... (logika handleClickOutside untuk menu export tetap sama)
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

  if (loading) {
    // ... (tampilan loading tetap sama)
    return (
      <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white p-6 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
        {/* Gunakan chartHeight untuk skeleton */}
        <div
          style={{ height: `${chartHeight}px` }}
          className="bg-gray-300 rounded"
        ></div>
      </div>
    );
  }

  if (error) {
    // ... (tampilan error tetap sama)
    return (
      <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white p-6 text-red-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            Laporan Produk Mobil
          </h3>
        </div>
        {/* Gunakan chartHeight untuk area pesan error */}
        <div
          className="text-center py-10"
          style={{
            height: `${chartHeight}px`,
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
        {/* ... (Header dan tombol periode tetap sama) */}
        <div className="w-full">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            {selectedTab === "Mingguan" &&
              "Laporan Produk Mobil 12 Minggu Terakhir"}
            {selectedTab === "Bulanan" &&
              `Laporan Produk Mobil Tahun ${currentYear}`}
            {selectedTab === "Tahunan" &&
              "Laporan Produk Mobil 5 Tahun Terakhir"}
          </h3>
        </div>
        <div className="flex items-start w-full gap-3 sm:w-auto sm:justify-end">
          <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-1 w-full sm:w-auto">
            {["Mingguan", "Bulanan", "Tahunan"].map((tab) => {
              if (tab === "Bulanan") {
                return (
                  <div key={tab} className="relative" ref={yearDropdownRef}>
                    <button
                      onClick={() => {
                        setSelectedTab("Bulanan");
                        setIsYearDropdownOpen((prev) => !prev);
                      }}
                      className={`px-3 py-1.5 font-semibold w-full rounded-md text-xs cursor-pointer transition-colors duration-150 flex items-center justify-center gap-1 whitespace-nowrap ${
                        selectedTab === tab
                          ? "text-orange-600 bg-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {tab} {currentYear}
                      <FaChevronDown
                        className={`h-3 w-3 transition-transform ${
                          isYearDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isYearDropdownOpen && selectedTab === "Bulanan" && (
                      <div className="absolute z-20 mt-1 right-0 w-full min-w-[80px] rounded-md bg-white shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
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
                                  ? "font-semibold text-orange-600 bg-orange-50"
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
                    key={tab}
                    onClick={() => {
                      setSelectedTab(tab);
                      setIsYearDropdownOpen(false);
                    }}
                    className={`px-3 py-1.5 font-semibold w-full rounded-md text-xs cursor-pointer transition-colors duration-150 ${
                      selectedTab === tab
                        ? "text-orange-600 bg-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab}
                  </button>
                );
              }
            })}
          </div>
          <div className="relative export-menu-container">
            {/* ... (Tombol export tetap sama) */}
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
      </div>

      {/* --- Area Chart atau Pesan Tidak Ada Data --- */}
      {hasActualData ? (
        <div>
          {/* Pastikan chart dirender hanya di client-side */}
          {typeof window !== "undefined" && (
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={chartHeight} // Gunakan variabel chartHeight
              width="100%"
              key={`${selectedTab}-${
                selectedTab === "Bulanan" ? currentYear : ""
              }`} // Key untuk re-render
            />
          )}
        </div>
      ) : (
        <div className="py-2">
          {" "}
          {/* Padding vertikal */}
          <div
            className="text-center text-gray-500"
            style={{
              height: `${chartHeight}px`, // Terapkan tinggi chart
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.875rem", // Ukuran font seperti di WebTrafficChart
            }}
          >
            {/* Tampilkan pesan loading jika masih loading (sebagai fallback) */}
            {loading ? "Memuat data..." : "Tidak ada produk untuk periode ini."}
          </div>
        </div>
      )}
      {/* --- Akhir Area Chart --- */}

      <div className="mt-4 flex items-center justify-between md:justify-start gap-4">
        {/* ... (Total Masuk dan Total Terjual tetap sama) */}
        <div className="flex items-start gap-2 text-orange-500">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg mb-3">
            <FaCar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Total Masuk</h4>
            <p className="text-md font-semibold">
              {processedData.masuk
                .reduce((a, b) => a + b, 0)
                .toLocaleString("id-ID")}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-[#37A3A3]">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mb-3">
            <FaBoxOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Total Terjual</h4>
            <p className="text-md font-semibold">
              {processedData.terjual
                .reduce((a, b) => a + b, 0)
                .toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
