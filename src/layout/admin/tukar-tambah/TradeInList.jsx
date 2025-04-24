"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import axios from "axios";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import Pagination from "@/components/global/Pagination";
import {
  FaPhone,
  FaWhatsapp,
  FaCar,
  FaCalendarAlt,
  FaBoxOpen,
  FaClock,
} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { formatNumberPhone } from "@/utils/formatNumberPhone";
import TradeInRequestDetail from "./TradeInRequestDetail";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import ScrollHorizontal from "@/components/common/ScrollHorizontal";

// --- Konstanta Filter ---
const TRADE_IN_STATUS_FILTER = {
  ALL: "all_status",
  PENDING: "Pending",
  CONTACTED: "Dihubungi",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const TRADE_IN_LOCATION_FILTER = {
  ALL: "all_location", // Default (tidak ditampilkan)
  SHOWROOM: "showroom",
  HOME: "home",
};

const TRADE_IN_SORT_ORDER = {
  LATEST_CREATED: "latest_created", // Default (tidak ditampilkan)
  NEAREST_INSPECTION: "nearest_inspection",
};

// --- Filter yang Akan Ditampilkan di UI ---
const displayableFilterOptions = [
  // Status
  { type: "status", value: TRADE_IN_STATUS_FILTER.ALL, label: "Semua Status" },
  { type: "status", value: TRADE_IN_STATUS_FILTER.PENDING, label: "Pending" },
  {
    type: "status",
    value: TRADE_IN_STATUS_FILTER.CONTACTED,
    label: "Dihubungi",
  },
  { type: "status", value: TRADE_IN_STATUS_FILTER.COMPLETED, label: "Selesai" },
  {
    type: "status",
    value: TRADE_IN_STATUS_FILTER.CANCELLED,
    label: "Dibatalkan",
  },
  {
    type: "location",
    value: TRADE_IN_LOCATION_FILTER.SHOWROOM,
    label: "Showroom",
  },
  {
    type: "location",
    value: TRADE_IN_LOCATION_FILTER.HOME,
    label: "Rumah Pelanggan",
  },
  {
    type: "sortBy",
    value: TRADE_IN_SORT_ORDER.NEAREST_INSPECTION,
    label: "Waktu Inspeksi Terdekat",
  },
];
// -----------------------------------------

// --- State Default untuk Reset ---
const defaultFilters = {
  status: TRADE_IN_STATUS_FILTER.ALL,
  location: TRADE_IN_LOCATION_FILTER.ALL,
  sortBy: TRADE_IN_SORT_ORDER.LATEST_CREATED,
};
// --------------------------------

const fetcher = (url) => axios.get(url).then((res) => res.data);

const API_ENDPOINT = "http://localhost:5000/api/trade-in";
const REQUESTS_PER_PAGE = 12;

const TradeInList = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTradeInRequestId, setSelectedTradeInRequestId] =
    useState(null);
  const [updatingStatusTradeInRequestId, setUpdatingStatusTradeInRequestId] =
    useState(null);

  // State untuk filter LOGIKA yang diterapkan
  const [activeFilters, setActiveFilters] = useState(defaultFilters);

  // State untuk menentukan tombol mana yang AKTIF SECARA VISUAL
  const [visuallyActiveFilter, setVisuallyActiveFilter] = useState({
    type: "status",
    value: TRADE_IN_STATUS_FILTER.ALL, // Default visual adalah "Semua Status"
  });

  const {
    data: response,
    error,
    isLoading,
    mutate: mutateList,
  } = useSWR(API_ENDPOINT, fetcher, {
    revalidateOnFocus: true,
  });

  // --- Handler untuk mengubah filter ---
  const handleFilterClick = (clickedType, clickedValue) => {
    // 1. Tentukan state filter logis yang baru
    const newLogicalFilters = {
      ...defaultFilters,
      [clickedType]: clickedValue,
    };
    setActiveFilters(newLogicalFilters);

    // 2. Update filter yang aktif secara visual
    setVisuallyActiveFilter({ type: clickedType, value: clickedValue });

    // 3. Reset pagination
    setCurrentPage(0);
  };

  const handleStatusUpdateFilter = (updatedRequestId, newStatus) => {
    if (
      newStatus === TRADE_IN_STATUS_FILTER.CONTACTED ||
      newStatus === TRADE_IN_STATUS_FILTER.COMPLETED ||
      newStatus === TRADE_IN_STATUS_FILTER.CANCELLED
    ) {
      handleFilterClick("status", newStatus);
    }
  };

  // --- Logika Filtering dan Sorting (Client-Side - Menggunakan activeFilters) ---
  const filteredAndSortedRequests = useMemo(() => {
    let requests =
      response && Array.isArray(response.data) ? response.data : [];

    // Filter berdasarkan Status (dari activeFilters)
    if (activeFilters.status !== TRADE_IN_STATUS_FILTER.ALL) {
      requests = requests.filter((req) => req.status === activeFilters.status);
    }

    // Filter berdasarkan Lokasi (dari activeFilters)
    if (activeFilters.location !== TRADE_IN_LOCATION_FILTER.ALL) {
      const targetLocationType = activeFilters.location;
      requests = requests.filter((req) => {
        if (targetLocationType === TRADE_IN_LOCATION_FILTER.HOME) {
          return (
            req.inspectionLocationType !== TRADE_IN_LOCATION_FILTER.SHOWROOM &&
            req.inspectionLocationType
          );
        }
        return req.inspectionLocationType === targetLocationType;
      });
    }

    // Sorting (dari activeFilters)
    if (activeFilters.sortBy === TRADE_IN_SORT_ORDER.NEAREST_INSPECTION) {
      requests = [...requests].sort((a, b) => {
        const dateTimeA = new Date(
          `${a.inspectionDate}T${a.inspectionTime || "00:00:00"}`
        );
        const dateTimeB = new Date(
          `${b.inspectionDate}T${b.inspectionTime || "00:00:00"}`
        );
        const timeA = !isNaN(dateTimeA.getTime())
          ? dateTimeA.getTime()
          : Infinity;
        const timeB = !isNaN(dateTimeB.getTime())
          ? dateTimeB.getTime()
          : Infinity;
        return timeA - timeB;
      });
    }

    return requests;
  }, [response?.data, activeFilters]); // Bergantung pada activeFilters logis

  // --- Loading dan Error Handling ---
  if (isLoading) {
    return (
      <div className="mt-6 p-4 border rounded-lg shadow bg-white">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Permintaan Tukar Tambah
        </h2>
        <p className="text-center text-gray-500">Memuat data...</p>
      </div>
    );
  }

  if (error) {
    console.error("Error fetching trade-in requests:", error);
    return (
      <div className="mt-6 p-4 border rounded-lg shadow bg-white">
        <h2 className="text-xl font-semibold mb-4 text-red-700">
          Permintaan Tukar Tambah
        </h2>
        <p className="text-center text-red-600">
          Gagal memuat data permintaan. Silakan coba lagi nanti.
        </p>
      </div>
    );
  }

  // --- Pagination Logic (Gunakan filteredAndSortedRequests) ---
  const tradeInRequests = Array.isArray(filteredAndSortedRequests)
    ? filteredAndSortedRequests
    : [];
  const pageCount = Math.ceil(tradeInRequests.length / REQUESTS_PER_PAGE);
  const indexOfLastTradeInRequest = (currentPage + 1) * REQUESTS_PER_PAGE;
  const indexOfFirstTradeInRequest =
    indexOfLastTradeInRequest - REQUESTS_PER_PAGE;
  const currentTradeInRequests = tradeInRequests.slice(
    indexOfFirstTradeInRequest,
    indexOfLastTradeInRequest
  );

  const handlePageChange = (data) => {
    setCurrentPage(data.selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const breadcrumbItems = [
    { label: "Beranda", href: "/admin" },
    { label: "Tukar Tambah", href: "" },
  ];

  const handleContactFromList = async (e, tradeInRequest) => {
    e.stopPropagation();
    const tradeInRequestId = tradeInRequest._id;
    const currentStatus = tradeInRequest.status;
    const phoneNumber = tradeInRequest.customerPhoneNumber;
    const originalRequests = response?.data || [];

    if (!phoneNumber) {
      toast.error("Nomor telepon pelanggan tidak tersedia.");
      return;
    }

    if (currentStatus === "Pending") {
      setUpdatingStatusTradeInRequestId(tradeInRequestId);
      try {
        const updateResponse = await axios.patch(
          `${API_ENDPOINT}/${tradeInRequestId}`,
          {
            status: "Dihubungi",
          }
        );

        if (updateResponse.data && updateResponse.data.success) {
          const updatedOriginalRequests = originalRequests.map((req) =>
            req._id === tradeInRequestId ? { ...req, status: "Dihubungi" } : req
          );
          mutateList({ success: true, data: updatedOriginalRequests }, false);

          toast.success("Status berhasil diperbarui!", {
            className: "custom-toast",
          });

          handleFilterClick("status", TRADE_IN_STATUS_FILTER.CONTACTED);

          openWhatsApp(tradeInRequest);
        } else {
          throw new Error(
            updateResponse.data.message || "Gagal memperbarui status."
          );
        }
      } catch (updateError) {
        console.error("Failed to update status from list:", updateError);
        const errorMessage =
          updateError.response?.data?.message ||
          updateError.message ||
          "Gagal memperbarui status.";
        toast.error(errorMessage, { className: "custom-toast" });
      } finally {
        setUpdatingStatusTradeInRequestId(null);
      }
    } else {
      openWhatsApp(tradeInRequest);
    }
  };

  const openWhatsApp = (tradeInRequest) => {
    if (tradeInRequest.customerPhoneNumber) {
      const phone = tradeInRequest.customerPhoneNumber.startsWith("0")
        ? "62" + tradeInRequest.customerPhoneNumber.substring(1)
        : tradeInRequest.customerPhoneNumber.startsWith("62")
        ? tradeInRequest.customerPhoneNumber
        : "62" + tradeInRequest.customerPhoneNumber;

      const customerName = tradeInRequest.customerName || "Pelanggan";
      const companyName = "Mukrindo Motor";
      const inspectionDate = tradeInRequest.inspectionDate
        ? new Date(tradeInRequest.inspectionDate).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "(Tanggal belum ada)";
      const inspectionTime =
        tradeInRequest.inspectionTime || "(Waktu belum ditentukan)";
      const inspectionLocationText = getInspectionLocationText(
        tradeInRequest.inspectionLocationType
      );
      const fullLocationDetail =
        tradeInRequest.inspectionLocationType === "showroom"
          ? `Showroom kami di ${
              tradeInRequest.inspectionShowroomAddress || "(Alamat Showroom)"
            }`
          : `${tradeInRequest.inspectionFullAddress || ""}, ${
              tradeInRequest.inspectionCity || ""
            }, ${tradeInRequest.inspectionProvince || ""}`
              .replace(/ ,|, $/g, "")
              .trim() || "(Alamat Pelanggan)";

      let message = `Halo Bapak/Ibu ${customerName},\n\n`;
      message += `Perkenalkan, Kami dari tim ${companyName}. Terima kasih sudah mengajukan permintaan tukar tambah yang Bapak/Ibu ajukan melalui website kami.\n\n`;
      message += `Kami ingin mengonfirmasi jadwal inspeksi mobil Bapak/Ibu yang telah dijadwalkan pada:\n`;
      message += `    • Tanggal: ${inspectionDate}\n`;
      message += `    • Waktu: ${inspectionTime}\n`;
      message += `    • Lokasi: ${inspectionLocationText} (${fullLocationDetail})\n\n`;
      message += `Mohon konfirmasi kesesuaian jadwal ini.\n\n`;
      message += `Jika ada pertanyaan lebih lanjut, jangan ragu untuk membalas pesan ini atau menghubungi kami.\n\n`;
      message += `Terima kasih, Hormat kami!\n`;
      message += `${companyName}`;

      const encodedMessage = encodeURIComponent(message);

      window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
    }
  };

  const handleRowClick = (tradeInRequestId) => {
    setSelectedTradeInRequestId(tradeInRequestId);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTradeInRequestId(null);
    document.body.style.overflow = "auto";
  };

  const getInspectionLocationText = (locationType) => {
    if (!locationType) return "-";
    if (locationType === TRADE_IN_LOCATION_FILTER.SHOWROOM) return "Showroom";
    return "Rumah Pelanggan";
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const modalVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "tween", duration: 0.4, ease: "easeInOut" },
    },
    exit: {
      y: "100%",
      opacity: 0,
      transition: { type: "tween", duration: 0.4, ease: "easeInOut" },
    },
  };

  // --- Fungsi Styling Tombol (Berdasarkan visuallyActiveFilter) ---
  const getButtonClass = (buttonType, buttonValue) => {
    const isActive =
      visuallyActiveFilter.type === buttonType &&
      visuallyActiveFilter.value === buttonValue;
    return `flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
      isActive
        ? "bg-orange-100 text-orange-500 border border-orange-500"
        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
    }`;
  };

  // --- Render Component ---
  return (
    <div>
      <BreadcrumbNav items={breadcrumbItems} />

      <h2 className="text-sm lg:text-lg leading-6 font-semibold text-gray-700 mb-4">
        Permintaan Tukar Tambah Terbaru
      </h2>

      <div className="mb-5">
        <ScrollHorizontal buttonVerticalAlign="top">
          {displayableFilterOptions.map((option) => (
            <button
              key={`${option.type}-${option.value}`}
              onClick={() => handleFilterClick(option.type, option.value)}
              className={getButtonClass(option.type, option.value)}
            >
              {option.label}
            </button>
          ))}
        </ScrollHorizontal>
      </div>

      {/* === PERUBAHAN DIMULAI DI SINI === */}
      {tradeInRequests.length === 0 && !isLoading ? (
        // Tampilkan pesan jika tidak ada data yang cocok (di luar container utama)
        <div className="flex justify-center items-center h-[50vh] text-center mt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center text-center sm:text-left">
            <FaBoxOpen className="w-24 h-24 sm:w-36 sm:h-36 text-gray-500" />
            <div className="flex flex-col text-gray-600 mt-4 sm:mt-0">
              <p className="text-2xl font-semibold">Oops!</p>
              <p>
                Tidak ada permintaan tukar tambah yang cocok dengan filter yang
                dipilih.
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Tampilkan daftar jika ada data (di dalam container utama)
        <div className="lg:p-6 rounded-xl shadow-lg bg-white">
          {/* Mobile View */}
          <div className="space-y-4 lg:space-y-0 lg:hidden">
            {currentTradeInRequests.map((tradeInRequest) => (
              <div
                key={tradeInRequest._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 cursor-pointer hover:bg-blue-50 transition-colors duration-150 ease-in-out"
                onClick={() => handleRowClick(tradeInRequest._id)}
              >
                {/* ... Konten Card Mobile ... */}
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold text-gray-800 truncate pr-2">
                    {tradeInRequest.customerName || "-"}
                  </span>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${
                      tradeInRequest.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : tradeInRequest.status === "Dihubungi"
                        ? "bg-blue-100 text-blue-800"
                        : tradeInRequest.status === "Selesai"
                        ? "bg-green-100 text-green-800"
                        : tradeInRequest.status === "Dibatalkan"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {tradeInRequest.status || "N/A"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 py-2">
                  <div className="flex items-center space-x-2">
                    <FaPhone className="text-gray-600 w-5 h-5" />
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs text-gray-700">Nomor Telepon</p>
                      <span className="text-gray-900 font-medium text-xs">
                        {tradeInRequest.customerPhoneNumber
                          ? `(+62) ${formatNumberPhone(
                              tradeInRequest.customerPhoneNumber
                            )}`
                          : "-"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaLocationDot className="text-gray-600 w-5 h-5" />
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs text-gray-700">Lokasi Inspeksi</p>
                      <span className="text-gray-900 font-medium text-xs">
                        {getInspectionLocationText(
                          tradeInRequest.inspectionLocationType
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaCar className="text-gray-600 w-5 h-5" />
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs text-gray-700">Mobil Lama</p>
                      <span className="text-gray-900 font-medium text-xs">
                        {`${tradeInRequest.tradeInBrand || ""} ${
                          tradeInRequest.tradeInModel || ""
                        } ${tradeInRequest.tradeInVariant || ""} ${
                          tradeInRequest.tradeInYear || ""
                        }`.trim() || "-"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-gray-600 w-5 h-5" />
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs text-gray-700">Tanggal Inspeksi</p>
                      <span className="text-gray-900 font-medium text-xs">
                        {tradeInRequest.inspectionDate
                          ? new Date(
                              tradeInRequest.inspectionDate
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaCar className="text-gray-600 w-5 h-5" />
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs text-gray-700">
                        Preferensi Mobil Baru
                      </p>
                      <span className="text-gray-900 font-medium text-xs">
                        {`${tradeInRequest.newCarBrandPreference || ""} ${
                          tradeInRequest.newCarModelPreference || ""
                        }`.trim() || "-"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaClock className="text-gray-600 w-5 h-5" />
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs text-gray-700">Jam Inspeksi</p>
                      <span className="text-gray-900 font-medium text-xs">
                        {tradeInRequest.inspectionTime || "-"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => handleContactFromList(e, tradeInRequest)}
                    className={`p-2 rounded-full text-green-500 hover:bg-green-100 transition-colors ${
                      updatingStatusTradeInRequestId === tradeInRequest._id ||
                      !tradeInRequest.customerPhoneNumber
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      updatingStatusTradeInRequestId === tradeInRequest._id ||
                      !tradeInRequest.customerPhoneNumber
                    }
                    aria-label="Hubungi via WhatsApp"
                  >
                    {updatingStatusTradeInRequestId === tradeInRequest._id ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <FaWhatsapp size={20} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Dekstop View */}
          <div className="hidden lg:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nama Pelanggan
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    No. Telepon
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Mobil Lama
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Preferensi Mobil
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Lokasi
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tanggal
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Jam
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hubungi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentTradeInRequests.map((tradeInRequest, index) => (
                  <tr
                    key={tradeInRequest._id}
                    onClick={() => handleRowClick(tradeInRequest._id)}
                    className={`
                    ${index % 2 === 1 ? "bg-gray-50" : "bg-white"}
                    hover:bg-blue-50 cursor-pointer transition-colors duration-150 ease-in-out`}
                  >
                    <td className="px-3 py-4 text-xs font-medium text-gray-900 whitespace-normal break-words">
                      {tradeInRequest.customerName || "-"}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                      {tradeInRequest.customerPhoneNumber
                        ? `(+62) ${formatNumberPhone(
                            tradeInRequest.customerPhoneNumber
                          )}`
                        : "-"}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                      {`${tradeInRequest.tradeInBrand || ""} ${
                        tradeInRequest.tradeInModel || ""
                      } (${tradeInRequest.tradeInYear || ""})`.trim() || "-"}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                      {`${tradeInRequest.newCarBrandPreference || ""} ${
                        tradeInRequest.newCarModelPreference || ""
                      }`.trim() || "-"}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                      {getInspectionLocationText(
                        tradeInRequest.inspectionLocationType
                      )}
                    </td>
                    <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                      {tradeInRequest.inspectionDate
                        ? new Date(
                            tradeInRequest.inspectionDate
                          ).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>

                    <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                      {tradeInRequest.inspectionTime || "-"}
                    </td>

                    <td className="px-2 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tradeInRequest.status === "Pending"
                            ? "bg-gradient-to-r from-yellow-50 to-yellow-300 text-yellow-700"
                            : tradeInRequest.status === "Dihubungi"
                            ? "bg-gradient-to-r from-blue-50 to-blue-300 text-blue-700"
                            : tradeInRequest.status === "Selesai"
                            ? "bg-gradient-to-r from-green-50 to-green-300 text-green-700"
                            : tradeInRequest.status === "Dibatalkan"
                            ? "bg-gradient-to-r from-red-50 to-red-300 text-red-700"
                            : "bg-gradient-to-r from-gray-50 to-gray-300 text-gray-700"
                        }`}
                      >
                        {tradeInRequest.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-xs font-medium text-center">
                      <button
                        type="button"
                        onClick={(e) =>
                          handleContactFromList(e, tradeInRequest)
                        }
                        className={`text-green-500 hover:text-green-700 transition-colors inline-block cursor-pointer ${
                          updatingStatusTradeInRequestId ===
                            tradeInRequest._id ||
                          !tradeInRequest.customerPhoneNumber
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={
                          updatingStatusTradeInRequestId ===
                            tradeInRequest._id ||
                          !tradeInRequest.customerPhoneNumber
                        }
                        aria-label="Hubungi via WhatsApp"
                      >
                        {updatingStatusTradeInRequestId ===
                        tradeInRequest._id ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <FaWhatsapp size={20} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* === PERUBAHAN BERAKHIR DI SINI === */}

      {/* Modal Detail (Tetap sama) */}
      <AnimatePresence>
        {isModalOpen && selectedTradeInRequestId && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 bg-black/60 z-50"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={handleCloseModal}
            />
            <motion.div
              key="modal-content"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed bottom-0 left-0 right-0 h-full md:flex md:items-center md:justify-center z-50"
              onClick={handleCloseModal}
            >
              <div
                className="bg-white w-full h-full
                 md:max-w-7xl md:max-h-[70vh] md:rounded-2xl md:shadow-2xl
                 relative flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <TradeInRequestDetail
                  requestId={selectedTradeInRequestId}
                  onClose={handleCloseModal}
                  mutateList={mutateList}
                  currentRequests={response?.data || []}
                  onStatusUpdated={handleStatusUpdateFilter}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Pagination (Tetap sama, hanya ditampilkan jika pageCount > 1) */}
      {pageCount > 1 && (
        <div className="mt-6">
          <Pagination
            key={`tradein-pagination-${activeFilters.status}-${activeFilters.location}-${activeFilters.sortBy}`}
            pageCount={pageCount}
            forcePage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default TradeInList;
