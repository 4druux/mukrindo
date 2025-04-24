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
  FaMoneyBillWave,
} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { formatNumberPhone } from "@/utils/formatNumberPhone";
import { formatNumber } from "@/utils/formatNumber";
import BuySellRequestDetail from "./BuySellRequestDetail";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import ScrollHorizontal from "@/components/common/ScrollHorizontal";

// --- Konstanta Filter (Diasumsikan sama dengan Trade-In) ---
const SELL_REQUEST_STATUS_FILTER = {
  ALL: "all_status",
  PENDING: "Pending",
  CONTACTED: "Dihubungi",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const SELL_REQUEST_LOCATION_FILTER = {
  ALL: "all_location",
  SHOWROOM: "showroom",
  HOME: "home",
};

const SELL_REQUEST_SORT_ORDER = {
  LATEST_CREATED: "latest_created",
  NEAREST_INSPECTION: "nearest_inspection",
};

// --- Filter yang Akan Ditampilkan di UI (Diasumsikan sama) ---
const displayableFilterOptions = [
  {
    type: "status",
    value: SELL_REQUEST_STATUS_FILTER.ALL,
    label: "Semua Status",
  },
  {
    type: "status",
    value: SELL_REQUEST_STATUS_FILTER.PENDING,
    label: "Pending",
  },
  {
    type: "status",
    value: SELL_REQUEST_STATUS_FILTER.CONTACTED,
    label: "Dihubungi",
  },
  {
    type: "status",
    value: SELL_REQUEST_STATUS_FILTER.COMPLETED,
    label: "Selesai",
  },
  {
    type: "status",
    value: SELL_REQUEST_STATUS_FILTER.CANCELLED,
    label: "Dibatalkan",
  },
  {
    type: "location",
    value: SELL_REQUEST_LOCATION_FILTER.SHOWROOM,
    label: "Showroom",
  },
  {
    type: "location",
    value: SELL_REQUEST_LOCATION_FILTER.HOME,
    label: "Rumah Pelanggan",
  },
  {
    type: "sortBy",
    value: SELL_REQUEST_SORT_ORDER.NEAREST_INSPECTION,
    label: "Waktu Inspeksi Terdekat",
  },
];
// -----------------------------------------

// --- State Default untuk Reset (Diasumsikan sama) ---
const defaultFilters = {
  status: SELL_REQUEST_STATUS_FILTER.ALL,
  location: SELL_REQUEST_LOCATION_FILTER.ALL,
  sortBy: SELL_REQUEST_SORT_ORDER.LATEST_CREATED,
};
// --------------------------------

const fetcher = (url) => axios.get(url).then((res) => res.data);

// --- Endpoint API untuk Jual Mobil ---
const API_ENDPOINT = "http://localhost:5000/api/sell-requests"; // GANTI ENDPOINT
const REQUESTS_PER_PAGE = 12;

const BuySellList = () => {
  // GANTI NAMA KOMPONEN
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Ganti nama state untuk ID terpilih
  const [selectedSellRequestId, setSelectedSellRequestId] = useState(null);
  // Ganti nama state untuk ID yang sedang diupdate statusnya
  const [updatingStatusSellRequestId, setUpdatingStatusSellRequestId] =
    useState(null);

  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  const [visuallyActiveFilter, setVisuallyActiveFilter] = useState({
    type: "status",
    value: SELL_REQUEST_STATUS_FILTER.ALL,
  });

  const {
    data: response,
    error,
    isLoading,
    mutate: mutateList,
  } = useSWR(API_ENDPOINT, fetcher, {
    // Gunakan API_ENDPOINT yang baru
    revalidateOnFocus: true,
  });

  // --- Handler untuk mengubah filter (Sama) ---
  const handleFilterClick = (clickedType, clickedValue) => {
    const newLogicalFilters = {
      ...defaultFilters,
      [clickedType]: clickedValue,
    };
    setActiveFilters(newLogicalFilters);
    setVisuallyActiveFilter({ type: clickedType, value: clickedValue });
    setCurrentPage(0);
  };

  // --- Handler notifikasi update status (Sama, tapi gunakan konstanta filter yang sesuai) ---
  const handleStatusUpdateNotification = (updatedRequestId, newStatus) => {
    if (
      newStatus === SELL_REQUEST_STATUS_FILTER.CONTACTED ||
      newStatus === SELL_REQUEST_STATUS_FILTER.COMPLETED ||
      newStatus === SELL_REQUEST_STATUS_FILTER.CANCELLED
    ) {
      // Cek apakah filter visual saat ini adalah status yang sama, jika tidak, update
      if (
        visuallyActiveFilter.type !== "status" ||
        visuallyActiveFilter.value !== newStatus
      ) {
        handleFilterClick("status", newStatus);
      }
      // Jika filter visual sudah sama, tidak perlu klik ulang, biarkan SWR revalidate
    }
    // Jika status lain (misal kembali ke Pending), tidak perlu ubah filter visual
  };

  // --- Logika Filtering dan Sorting (Sama, pastikan field di backend sesuai) ---
  const filteredAndSortedRequests = useMemo(() => {
    let requests =
      response && Array.isArray(response.data) ? response.data : [];

    // Filter berdasarkan Status
    if (activeFilters.status !== SELL_REQUEST_STATUS_FILTER.ALL) {
      requests = requests.filter((req) => req.status === activeFilters.status);
    }

    // Filter berdasarkan Lokasi
    if (activeFilters.location !== SELL_REQUEST_LOCATION_FILTER.ALL) {
      const targetLocationType = activeFilters.location;
      requests = requests.filter((req) => {
        // Handle kasus 'rumah' (bisa jadi null/undefined atau 'rumah')
        if (targetLocationType === SELL_REQUEST_LOCATION_FILTER.HOME) {
          return (
            req.inspectionLocationType !== SELL_REQUEST_LOCATION_FILTER.SHOWROOM
          );
        }
        // Handle kasus 'showroom'
        return req.inspectionLocationType === targetLocationType;
      });
    }

    // Sorting
    if (activeFilters.sortBy === SELL_REQUEST_SORT_ORDER.NEAREST_INSPECTION) {
      requests = [...requests].sort((a, b) => {
        // Handle potensi null/undefined date/time
        const dateTimeA = a.inspectionDate
          ? new Date(`${a.inspectionDate}T${a.inspectionTime || "00:00:00"}`)
          : null;
        const dateTimeB = b.inspectionDate
          ? new Date(`${b.inspectionDate}T${b.inspectionTime || "00:00:00"}`)
          : null;

        const timeA =
          dateTimeA && !isNaN(dateTimeA.getTime())
            ? dateTimeA.getTime()
            : Infinity;
        const timeB =
          dateTimeB && !isNaN(dateTimeB.getTime())
            ? dateTimeB.getTime()
            : Infinity;

        // Jika salah satu null, yang non-null duluan
        if (timeA === Infinity && timeB !== Infinity) return 1;
        if (timeA !== Infinity && timeB === Infinity) return -1;
        if (timeA === Infinity && timeB === Infinity) return 0; // Keduanya null, urutan sama

        return timeA - timeB;
      });
    }
    // Default sort (latest created) sudah dihandle backend atau SWR fetch awal

    return requests;
  }, [response?.data, activeFilters]);

  // --- Loading dan Error Handling (Sama) ---
  if (isLoading) {
    return (
      <div className="mt-6 p-4 border rounded-lg shadow bg-white">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Permintaan Jual Mobil {/* Ganti Teks */}
        </h2>
        <p className="text-center text-gray-500">Memuat data...</p>
      </div>
    );
  }

  if (error) {
    console.error("Error fetching sell requests:", error); // Ganti Teks Log
    return (
      <div className="mt-6 p-4 border rounded-lg shadow bg-white">
        <h2 className="text-xl font-semibold mb-4 text-red-700">
          Permintaan Jual Mobil {/* Ganti Teks */}
        </h2>
        <p className="text-center text-red-600">
          Gagal memuat data permintaan. Silakan coba lagi nanti.
        </p>
      </div>
    );
  }

  // --- Pagination Logic (Sama) ---
  const sellRequests = Array.isArray(filteredAndSortedRequests) // Ganti Nama Variabel
    ? filteredAndSortedRequests
    : [];
  const pageCount = Math.ceil(sellRequests.length / REQUESTS_PER_PAGE);
  const indexOfLastSellRequest = (currentPage + 1) * REQUESTS_PER_PAGE; // Ganti Nama Variabel
  const indexOfFirstSellRequest = indexOfLastSellRequest - REQUESTS_PER_PAGE; // Ganti Nama Variabel
  const currentSellRequests = sellRequests.slice(
    // Ganti Nama Variabel
    indexOfFirstSellRequest,
    indexOfLastSellRequest
  );

  const handlePageChange = (data) => {
    setCurrentPage(data.selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Breadcrumb ---
  const breadcrumbItems = [
    { label: "Beranda", href: "/admin" },
    { label: "Jual Mobil", href: "" }, // Ganti Teks
  ];

  // --- Fungsi Kontak & Update Status dari List ---
  const handleContactFromList = async (e, sellRequest) => {
    // Ganti Nama Parameter
    e.stopPropagation();
    const sellRequestId = sellRequest._id; // Ganti Nama Variabel
    const currentStatus = sellRequest.status;
    const phoneNumber = sellRequest.customerPhoneNumber;
    const originalRequests = response?.data || [];

    if (!phoneNumber) {
      toast.error("Nomor telepon pelanggan tidak tersedia.");
      return;
    }

    // Jika status 'Pending', update dulu baru buka WhatsApp
    if (currentStatus === "Pending") {
      setUpdatingStatusSellRequestId(sellRequestId); // Ganti Nama State Setter
      try {
        const updateResponse = await axios.patch(
          `${API_ENDPOINT}/${sellRequestId}`, // Gunakan API_ENDPOINT & ID yang benar
          { status: "Dihubungi" }
        );

        if (updateResponse.data && updateResponse.data.success) {
          // Optimistic UI Update sebelum revalidasi SWR
          const updatedOriginalRequests = originalRequests.map((req) =>
            req._id === sellRequestId ? { ...req, status: "Dihubungi" } : req
          );
          mutateList({ success: true, data: updatedOriginalRequests }, false); // Update cache SWR tanpa re-fetch

          toast.success("Status berhasil diperbarui!", {
            className: "custom-toast",
          });

          // Pindah ke filter "Dihubungi" setelah update berhasil
          handleFilterClick("status", SELL_REQUEST_STATUS_FILTER.CONTACTED);

          // Buka WhatsApp setelah update berhasil
          openWhatsApp(sellRequest); // Ganti Nama Parameter
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
        mutateList(); // Revalidate data jika update gagal
      } finally {
        setUpdatingStatusSellRequestId(null); // Ganti Nama State Setter
      }
    } else {
      // Jika status bukan 'Pending', langsung buka WhatsApp
      openWhatsApp(sellRequest); // Ganti Nama Parameter
    }
  };

  // --- Fungsi Buka WhatsApp ---
  const openWhatsApp = (sellRequest) => {
    // Ganti Nama Parameter
    if (sellRequest.customerPhoneNumber) {
      // Format nomor telepon (Sama)
      const phone = sellRequest.customerPhoneNumber.startsWith("0")
        ? "62" + sellRequest.customerPhoneNumber.substring(1)
        : sellRequest.customerPhoneNumber.startsWith("62")
        ? sellRequest.customerPhoneNumber
        : "62" + sellRequest.customerPhoneNumber;

      // Ambil data untuk pesan
      const customerName = sellRequest.customerName || "Pelanggan";
      const companyName = "Mukrindo Motor"; // Sesuaikan nama perusahaan jika perlu
      const carDetails = `${sellRequest.carBrand || ""} ${
        sellRequest.carModel || ""
      } ${sellRequest.carYear || ""}`.trim();
      const inspectionDate = sellRequest.inspectionDate
        ? new Date(sellRequest.inspectionDate).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "(Tanggal belum ada)";
      const inspectionTime =
        sellRequest.inspectionTime || "(Waktu belum ditentukan)";
      const inspectionLocationText = getInspectionLocationText(
        sellRequest.inspectionLocationType
      ); // Gunakan fungsi helper
      const fullLocationDetail =
        sellRequest.inspectionLocationType === "showroom"
          ? `Showroom kami di ${
              sellRequest.inspectionShowroomAddress || "(Alamat Showroom)"
            }`
          : `${sellRequest.inspectionFullAddress || ""}, ${
              sellRequest.inspectionCity || ""
            }, ${sellRequest.inspectionProvince || ""}`
              .replace(/ ,|, $/g, "")
              .trim() || "(Alamat Pelanggan)";

      // --- Template Pesan WhatsApp (Disesuaikan untuk Jual Mobil) ---
      let message = `Halo Bapak/Ibu ${customerName},\n\n`;
      message += `Perkenalkan, Kami dari tim ${companyName}. Terima kasih sudah mengajukan permintaan jual mobil (${carDetails}) Bapak/Ibu melalui website kami.\n\n`; // Ganti Teks
      message += `Kami ingin mengonfirmasi jadwal inspeksi mobil Bapak/Ibu yang telah dijadwalkan pada:\n`;
      message += `    • Tanggal: ${inspectionDate}\n`;
      message += `    • Waktu: ${inspectionTime}\n`;
      message += `    • Lokasi: ${inspectionLocationText} (${fullLocationDetail})\n\n`;
      message += `Mohon konfirmasi kesesuaian jadwal ini.\n\n`;
      message += `Jika ada pertanyaan lebih lanjut, jangan ragu untuk membalas pesan ini atau menghubungi kami.\n\n`;
      message += `Terima kasih, Hormat kami!\n`;
      message += `${companyName}`;
      // --- Akhir Template Pesan ---

      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
    }
  };

  // --- Modal Handling (Ganti nama ID) ---
  const handleRowClick = (sellRequestId) => {
    // Ganti Nama Parameter
    setSelectedSellRequestId(sellRequestId); // Ganti Nama State Setter
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSellRequestId(null); // Ganti Nama State Setter
    document.body.style.overflow = "auto";
  };

  // --- Helper Teks Lokasi (Sama) ---
  const getInspectionLocationText = (locationType) => {
    if (!locationType) return "-";
    // Gunakan konstanta filter untuk konsistensi
    if (locationType === SELL_REQUEST_LOCATION_FILTER.SHOWROOM)
      return "Showroom";
    if (locationType === SELL_REQUEST_LOCATION_FILTER.HOME)
      return "Rumah Pelanggan";
    return locationType; // Fallback jika ada nilai lain
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

  // --- Fungsi Styling Tombol (Sama) ---
  const getButtonClass = (buttonType, buttonValue) => {
    const isActive =
      visuallyActiveFilter.type === buttonType &&
      visuallyActiveFilter.value === buttonValue;
    return `flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
      isActive
        ? "bg-orange-100 text-orange-500 border border-orange-500" // Active style
        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100" // Inactive style
    }`;
  };

  // --- Render Component ---
  return (
    <div>
      <BreadcrumbNav items={breadcrumbItems} />

      <h2 className="text-sm lg:text-lg leading-6 font-semibold text-gray-700 mb-4">
        Permintaan Jual Mobil Terbaru {/* Ganti Teks */}
      </h2>

      {/* Filter Buttons (Sama) */}
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

      {/* === Tampilan Daftar atau Pesan Kosong === */}
      {sellRequests.length === 0 && !isLoading ? (
        // Pesan jika tidak ada data (Ganti Teks)
        <div className="flex justify-center items-center h-[50vh] text-center mt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center text-center sm:text-left">
            <FaBoxOpen className="w-24 h-24 sm:w-36 sm:h-36 text-gray-500" />
            <div className="flex flex-col text-gray-600 mt-4 sm:mt-0">
              <p className="text-2xl font-semibold">Oops!</p>
              <p>
                Tidak ada permintaan jual mobil yang cocok dengan filter yang
                dipilih. {/* Ganti Teks */}
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Tampilkan daftar jika ada data
        <div className="lg:p-6 rounded-xl shadow-lg bg-white">
          {/* Mobile View */}
          <div className="space-y-4 lg:space-y-0 lg:hidden">
            {currentSellRequests.map(
              (
                sellRequest // Ganti Nama Variabel
              ) => (
                <div
                  key={sellRequest._id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 cursor-pointer hover:bg-blue-50 transition-colors duration-150 ease-in-out"
                  onClick={() => handleRowClick(sellRequest._id)} // Ganti ID
                >
                  {/* Card Header (Nama & Status - Sama) */}
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-gray-800 truncate pr-2">
                      {sellRequest.customerName || "-"}
                    </span>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${
                        sellRequest.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : sellRequest.status === "Dihubungi"
                          ? "bg-blue-100 text-blue-800"
                          : sellRequest.status === "Selesai"
                          ? "bg-green-100 text-green-800"
                          : sellRequest.status === "Dibatalkan"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {sellRequest.status || "N/A"}
                    </span>
                  </div>
                  {/* Card Body (Sesuaikan Fields) */}
                  <div className="grid grid-cols-2 gap-3 py-2">
                    {/* Nomor Telepon (Sama) */}
                    <div className="flex items-center space-x-2">
                      <FaPhone className="text-gray-600 w-5 h-5" />
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs text-gray-700">Nomor Telepon</p>
                        <span className="text-gray-900 font-medium text-xs">
                          {sellRequest.customerPhoneNumber
                            ? `(+62) ${formatNumberPhone(
                                sellRequest.customerPhoneNumber
                              )}`
                            : "-"}
                        </span>
                      </div>
                    </div>
                    {/* Lokasi Inspeksi (Sama) */}
                    <div className="flex items-center space-x-2">
                      <FaLocationDot className="text-gray-600 w-5 h-5" />
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs text-gray-700">Lokasi Inspeksi</p>
                        <span className="text-gray-900 font-medium text-xs">
                          {getInspectionLocationText(
                            sellRequest.inspectionLocationType
                          )}
                        </span>
                      </div>
                    </div>
                    {/* Mobil Dijual (Ganti Field) */}
                    <div className="flex items-center space-x-2">
                      <FaCar className="text-gray-600 w-5 h-5" />
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs text-gray-700">Mobil Dijual</p>
                        <span className="text-gray-900 font-medium text-xs">
                          {`${sellRequest.carBrand || ""} ${
                            sellRequest.carModel || ""
                          } ${sellRequest.carVariant || ""} (${
                            sellRequest.carYear || ""
                          })`.trim() || "-"}
                        </span>
                      </div>
                    </div>
                    {/* Tanggal Inspeksi (Sama) */}
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-gray-600 w-5 h-5" />
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs text-gray-700">
                          Tanggal Inspeksi
                        </p>
                        <span className="text-gray-900 font-medium text-xs">
                          {sellRequest.inspectionDate
                            ? new Date(
                                sellRequest.inspectionDate
                              ).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </span>
                      </div>
                    </div>
                    {/* Harga Penawaran (Field Baru) */}
                    <div className="flex items-center space-x-2">
                      <FaMoneyBillWave className="text-gray-600 w-5 h-5" />
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs text-gray-700">Harga Penawaran</p>
                        <span className="text-gray-900 font-medium text-xs">
                          {sellRequest.carPrice
                            ? `Rp ${formatNumber(
                                sellRequest.carPrice.toString()
                              )}`
                            : "-"}
                        </span>
                      </div>
                    </div>
                    {/* Jam Inspeksi (Sama) */}
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-gray-600 w-5 h-5" />
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs text-gray-700">Jam Inspeksi</p>
                        <span className="text-gray-900 font-medium text-xs">
                          {sellRequest.inspectionTime || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Tombol Kontak (Sama, tapi gunakan ID & state yang benar) */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => handleContactFromList(e, sellRequest)}
                      className={`p-2 rounded-full text-green-500 hover:bg-green-100 transition-colors ${
                        updatingStatusSellRequestId === sellRequest._id ||
                        !sellRequest.customerPhoneNumber
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={
                        updatingStatusSellRequestId === sellRequest._id ||
                        !sellRequest.customerPhoneNumber
                      }
                      aria-label="Hubungi via WhatsApp"
                    >
                      {updatingStatusSellRequestId === sellRequest._id ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <FaWhatsapp size={20} />
                      )}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Dekstop View */}
          <div className="hidden lg:block">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table Head (Sesuaikan Kolom) */}
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
                    Mobil Dijual
                  </th>{" "}
                  {/* Ganti Teks */}
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Harga Penawaran
                  </th>{" "}
                  {/* Ganti Teks */}
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
              {/* Table Body (Sesuaikan Data) */}
              <tbody className="divide-y divide-gray-200">
                {currentSellRequests.map(
                  (
                    sellRequest,
                    index // Ganti Nama Variabel
                  ) => (
                    <tr
                      key={sellRequest._id}
                      onClick={() => handleRowClick(sellRequest._id)} // Ganti ID
                      className={`${
                        index % 2 === 1 ? "bg-gray-50" : "bg-white"
                      } hover:bg-blue-50 cursor-pointer transition-colors duration-150 ease-in-out`}
                    >
                      {/* Nama Pelanggan (Sama) */}
                      <td className="px-3 py-4 text-xs font-medium text-gray-900 whitespace-normal break-words">
                        {sellRequest.customerName || "-"}
                      </td>
                      {/* No. Telepon (Sama) */}
                      <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                        {sellRequest.customerPhoneNumber
                          ? `(+62) ${formatNumberPhone(
                              sellRequest.customerPhoneNumber
                            )}`
                          : "-"}
                      </td>
                      {/* Mobil Dijual (Ganti Field) */}
                      <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                        {`${sellRequest.carBrand || ""} ${
                          sellRequest.carModel || ""
                        } (${sellRequest.carYear || ""})`.trim() || "-"}
                      </td>
                      {/* Harga Penawaran (Field Baru + Format) */}
                      <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                        {sellRequest.carPrice
                          ? `Rp ${formatNumber(
                              sellRequest.carPrice.toString()
                            )}`
                          : "-"}
                      </td>
                      {/* Lokasi (Sama) */}
                      <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                        {getInspectionLocationText(
                          sellRequest.inspectionLocationType
                        )}
                      </td>
                      {/* Tanggal (Sama) */}
                      <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                        {sellRequest.inspectionDate
                          ? new Date(
                              sellRequest.inspectionDate
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      {/* Jam (Sama) */}
                      <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                        {sellRequest.inspectionTime || "-"}
                      </td>
                      {/* Status (Sama) */}
                      <td className="px-2 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            sellRequest.status === "Pending"
                              ? "bg-gradient-to-r from-yellow-50 to-yellow-300 text-yellow-700"
                              : sellRequest.status === "Dihubungi"
                              ? "bg-gradient-to-r from-blue-50 to-blue-300 text-blue-700"
                              : sellRequest.status === "Selesai"
                              ? "bg-gradient-to-r from-green-50 to-green-300 text-green-700"
                              : sellRequest.status === "Dibatalkan"
                              ? "bg-gradient-to-r from-red-50 to-red-300 text-red-700"
                              : "bg-gradient-to-r from-gray-50 to-gray-300 text-gray-700"
                          }`}
                        >
                          {sellRequest.status || "N/A"}
                        </span>
                      </td>
                      {/* Tombol Kontak (Sama, tapi gunakan ID & state yang benar) */}
                      <td className="px-3 py-4 text-xs font-medium text-center">
                        <button
                          type="button"
                          onClick={(e) => handleContactFromList(e, sellRequest)}
                          className={`text-green-500 hover:text-green-700 transition-colors inline-block cursor-pointer ${
                            updatingStatusSellRequestId === sellRequest._id ||
                            !sellRequest.customerPhoneNumber
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={
                            updatingStatusSellRequestId === sellRequest._id ||
                            !sellRequest.customerPhoneNumber
                          }
                          aria-label="Hubungi via WhatsApp"
                        >
                          {updatingStatusSellRequestId === sellRequest._id ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <FaWhatsapp size={20} />
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && selectedSellRequestId && (
          <>
            {/* Backdrop (Sama) */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 bg-black/60 z-50"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={handleCloseModal}
            />
            {/* Modal Content (Sama) */}
            <motion.div
              key="modal-content"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed bottom-0 left-0 right-0 h-full md:flex md:items-center md:justify-center z-50"
              onClick={handleCloseModal} // Close on outer click
            >
              <div
                className="bg-white w-full h-full md:max-w-7xl md:max-h-[70vh] md:rounded-2xl md:shadow-2xl relative flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()} // Prevent closing on inner click
              >
                {/* === Panggil Komponen Detail Jual Mobil === */}
                <BuySellRequestDetail // GANTI KOMPONEN
                  requestId={selectedSellRequestId} // Ganti Nama Prop jika perlu, tapi 'requestId' generik
                  onClose={handleCloseModal}
                  mutateList={mutateList} // Untuk refresh list setelah update di modal
                  currentRequests={response?.data || []} // Kirim data list saat ini
                  onStatusUpdated={handleStatusUpdateNotification} // Kirim callback notifikasi
                />
                {/* ======================================== */}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Pagination (Sama, tapi key disesuaikan jika perlu) */}
      {pageCount > 1 && (
        <div className="mt-6">
          <Pagination
            key={`sellreq-pagination-${activeFilters.status}-${activeFilters.location}-${activeFilters.sortBy}`} // Ganti Key
            pageCount={pageCount}
            forcePage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default BuySellList; // GANTI NAMA EXPORT
