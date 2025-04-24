// BuySellRequestDetail.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import axios from "axios";
import { formatNumberPhone } from "@/utils/formatNumberPhone";
import { formatNumber } from "@/utils/formatNumber"; // Import formatNumber for price
import { X, ChevronDown, Loader2 } from "lucide-react";
import {
  FaPhone,
  FaUser,
  FaWhatsapp,
  FaEnvelope,
  FaCar,
  FaRoad,
  FaMap,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave, // Added for Price
} from "react-icons/fa";
import { MdOutlineColorLens } from "react-icons/md";
import { GiGearStickPattern } from "react-icons/gi";
import { FileCheck } from "lucide-react";
import { FaLocationDot } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

const fetcher = (url) => axios.get(url).then((res) => res.data);
// --- GANTI ENDPOINT API ---
const API_BASE_URL = "http://localhost:5000/api/sell-requests";

const BuySellRequestDetail = ({
  // --- GANTI NAMA KOMPONEN ---
  requestId,
  onClose,
  mutateList,
  currentRequests,
  onStatusUpdated,
}) => {
  const apiUrl = `${API_BASE_URL}/${requestId}`;
  const {
    data: response,
    error,
    isLoading,
    mutate: mutateDetail,
  } = useSWR(requestId ? apiUrl : null, fetcher);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const statusOptions = ["Pending", "Dihubungi", "Selesai", "Dibatalkan"];
  const currentStatus = response?.data?.status;

  const dropDownVariant = {
    open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === currentStatus || isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    setIsDropdownOpen(false);

    try {
      // --- Gunakan API Endpoint yang benar ---
      const updateResponse = await axios.patch(`${API_BASE_URL}/${requestId}`, {
        status: newStatus,
      });

      if (updateResponse.data && updateResponse.data.success) {
        await mutateDetail(); // Revalidate detail data

        // --- Update cache list (Sama seperti TradeIn) ---
        if (mutateList && currentRequests) {
          const requestIndex = currentRequests.findIndex(
            (req) => req._id === requestId
          );

          if (requestIndex !== -1) {
            const updatedRequests = [
              ...currentRequests.slice(0, requestIndex),
              {
                ...currentRequests[requestIndex],
                status: newStatus,
              },
              ...currentRequests.slice(requestIndex + 1),
            ];
            // Update cache SWR list tanpa re-fetch immediate
            mutateList({ success: true, data: updatedRequests }, false);
          } else {
            console.warn(
              "Request yang diupdate tidak ditemukan di cache list. Memaksa revalidasi."
            );
            mutateList(); // Revalidate list jika tidak ditemukan di cache
          }
        } else {
          console.warn(
            "mutateList atau currentRequests tidak tersedia. Memaksa revalidasi."
          );
          if (mutateList) mutateList(); // Revalidate list jika props tidak ada
        }

        // --- Panggil callback onStatusUpdated (Sama seperti TradeIn) ---
        if (onStatusUpdated) {
          onStatusUpdated(requestId, newStatus);
        }

        toast.success("Status berhasil diperbarui!", {
          className: "custom-toast",
        });
        onClose(); // Tutup modal setelah update berhasil
      } else {
        throw new Error(
          updateResponse.data.message || "Gagal memperbarui status."
        );
      }
    } catch (updateError) {
      console.error("Failed to update status:", updateError);
      const errorMessage =
        updateError.response?.data?.message ||
        updateError.message ||
        "Gagal memperbarui status.";
      toast.error(errorMessage, { className: "custom-toast" });
      // Revalidate detail jika gagal untuk memastikan data konsisten
      mutateDetail();
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleContactButtonClick = async () => {
    // --- Ganti nama variabel ---
    const sellRequest = response?.data;
    if (!sellRequest) {
      toast.error("Data permintaan tidak tersedia.");
      return;
    }

    let statusUpdateSuccess = true;
    // --- Update status ke 'Dihubungi' jika 'Pending' (Sama) ---
    if (currentStatus === "Pending" && !isUpdatingStatus) {
      try {
        // Panggil handleStatusUpdate yang sudah ada
        await handleStatusUpdate("Dihubungi");
        // handleStatusUpdate akan menutup modal jika berhasil,
        // jadi kita tidak perlu onClose() lagi di sini jika update berhasil.
        // Jika gagal, error akan ditangkap di handleStatusUpdate.
      } catch (error) {
        // Error sudah dihandle di handleStatusUpdate, tidak perlu toast lagi
        console.error("Gagal update status saat menghubungi:", error);
        statusUpdateSuccess = false;
        return; // Hentikan proses jika update status gagal
      }
    }

    // --- Buka WhatsApp jika status bukan Pending ATAU update status berhasil ---
    // Periksa juga nomor telepon
    if (
      (currentStatus !== "Pending" || statusUpdateSuccess) &&
      sellRequest.customerPhoneNumber
    ) {
      // Format nomor telepon (Sama)
      const phone = sellRequest.customerPhoneNumber.startsWith("0")
        ? "62" + sellRequest.customerPhoneNumber.substring(1)
        : sellRequest.customerPhoneNumber.startsWith("62")
        ? sellRequest.customerPhoneNumber
        : "62" + sellRequest.customerPhoneNumber;

      // --- Ambil data untuk pesan WhatsApp (Sesuaikan dengan Jual Mobil) ---
      const customerName = sellRequest.customerName || "Pelanggan";
      const companyName = "Mukrindo Motor"; // Sesuaikan jika perlu
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
      const inspectionLocation =
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
      message += `    ��� Tanggal: ${inspectionDate}\n`;
      message += `    • Waktu: ${inspectionTime}\n`;
      message += `    • Lokasi: ${inspectionLocation}\n\n`;
      message += `Mohon konfirmasi kesesuaian jadwal ini.\n\n`;
      message += `Jika ada pertanyaan lebih lanjut, jangan ragu untuk membalas pesan ini atau menghubungi kami.\n\n`;
      message += `Terima kasih, Hormat kami!\n`;
      message += `${companyName}`;
      // --- Akhir Template Pesan ---

      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");

      // Tutup modal hanya jika status *sebelumnya* bukan Pending
      // Jika status sebelumnya Pending, modal sudah ditutup oleh handleStatusUpdate
      if (currentStatus !== "Pending") {
        onClose();
      }
    } else if (!sellRequest.customerPhoneNumber) {
      toast.error("Nomor telepon pelanggan tidak tersedia.");
    }
    // Jika statusUpdateSuccess false, tidak perlu melakukan apa-apa lagi karena sudah return
  };

  // --- useEffect untuk dropdown (Sama) ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // --- Loading State (Sama) ---
  if (isLoading && !response) {
    return (
      <div className="flex-grow flex items-center justify-center p-10">
        Memuat detail permintaan...
      </div>
    );
  }

  // --- Error State (Sama) ---
  if (error) {
    console.error("Error fetching sell request detail:", error); // Ganti Teks Log
    return (
      <div className="flex-grow flex items-center justify-center p-10 text-red-600">
        Gagal memuat detail permintaan. ID: {requestId}
      </div>
    );
  }

  // --- Not Found State (Sama) ---
  if (!isLoading && (!response?.success || !response?.data)) {
    return (
      <div className="flex-grow flex items-center justify-center p-10 text-gray-600">
        Data permintaan tidak ditemukan.
      </div>
    );
  }

  // --- Ganti nama variabel data ---
  const sellRequest = response.data;

  return (
    <div className="flex flex-col flex-grow h-full">
      {/* Header (Sama, hanya ganti teks judul) */}
      <div
        className={`sticky top-0 z-10 flex-shrink-0 ${
          currentStatus === "Pending"
            ? "bg-gradient-to-r from-yellow-50 to-yellow-300"
            : currentStatus === "Dihubungi"
            ? "bg-gradient-to-r from-blue-50 to-blue-300"
            : currentStatus === "Selesai"
            ? "bg-gradient-to-r from-green-50 to-green-300"
            : currentStatus === "Dibatalkan"
            ? "bg-gradient-to-r from-red-50 to-red-300"
            : "bg-gradient-to-r from-gray-50 to-gray-300"
        }`}
      >
        <div className="p-3 lg:p-4 flex justify-between items-center">
          <div className="flex gap-3">
            <h2 className="text-sm lg:text-lg leading-6 font-semibold text-gray-700">
              Detail Permintaan Jual Mobil {/* --- GANTI TEKS --- */}
            </h2>
            {/* Status Badge Mobile (Sama) */}
            <div className="block lg:hidden">
              <span
                className={`px-2 inline-flex text-[10px] leading-5 font-semibold rounded-full w-fit ${
                  currentStatus === "Pending"
                    ? "bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-700 animate-pulse"
                    : currentStatus === "Dihubungi"
                    ? "bg-gradient-to-r from-blue-200 to-blue-300 text-blue-700 animate-pulse"
                    : currentStatus === "Selesai"
                    ? "bg-gradient-to-r from-green-200 to-green-300 text-green-700 animate-pulse"
                    : currentStatus === "Dibatalkan"
                    ? "bg-gradient-to-r from-red-200 to-red-300 text-red-700 animate-pulse"
                    : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 animate-pulse"
                }`}
              >
                {currentStatus || "N/A"}
              </span>
            </div>
          </div>
          {/* Tombol Close (Sama) */}
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
            aria-label="Close detail"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto">
        <div className="p-4 lg:p-6">
          {/* ID, Status Desktop, CreatedAt, Status Dropdown (Sama) */}
          <div className="flex flex-col lg:flex-row justify-between items-end lg:items-start mb-4 lg:px-4">
            <div className="flex item-start gap-2">
              <span className="text-xs lg:text-sm text-gray-700 lg:mt-1">
                ID: {sellRequest._id} {/* --- Ganti Variabel --- */}
              </span>
              {/* Status Badge Desktop (Sama) */}
              <div className="hidden lg:block">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${
                    currentStatus === "Pending"
                      ? "bg-gradient-to-r from-yellow-50 to-yellow-300 text-yellow-700 animate-pulse"
                      : currentStatus === "Dihubungi"
                      ? "bg-gradient-to-r from-blue-50 to-blue-300 text-blue-700 animate-pulse"
                      : currentStatus === "Selesai"
                      ? "bg-gradient-to-r from-green-50 to-green-300 text-green-700 animate-pulse"
                      : currentStatus === "Dibatalkan"
                      ? "bg-gradient-to-r from-red-50 to-red-300 text-red-700 animate-pulse"
                      : "bg-gradient-to-r from-gray-50 to-gray-300 text-gray-700 animate-pulse"
                  }`}
                >
                  {currentStatus || "N/A"}
                </span>
              </div>
            </div>
            {/* CreatedAt & Status Dropdown (Sama) */}
            <div className="flex flex-col gap-1 relative" ref={dropdownRef}>
              <p className="text-xs text-gray-700">
                Dibuat: {""}
                {new Date(sellRequest.createdAt).toLocaleDateString(
                  /* --- Ganti Variabel --- */ "id-ID",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </p>
              <section>
                <button
                  onClick={() =>
                    !isUpdatingStatus && setIsDropdownOpen(!isDropdownOpen)
                  }
                  className={`flex items-center justify-between w-full max-w-xs rounded-full px-3 py-1 bg-white border border-gray-300 shadow-sm focus:outline-none text-xs cursor-pointer ${
                    isUpdatingStatus ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={currentStatus === null || isUpdatingStatus}
                >
                  <span className="flex items-center">
                    {isUpdatingStatus && (
                      <Loader2 size={12} className="animate-spin mr-1" />
                    )}
                    {currentStatus ?? "Memuat..."}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isDropdownOpen && currentStatus !== null && (
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={dropDownVariant}
                      className="absolute right-0 mt-1 w-full max-w-xs bg-white border border-gray-300 rounded-lg shadow-lg z-20 overflow-hidden"
                    >
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(status)}
                          className="block w-full text-left text-xs px-3 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:bg-gray-50"
                          disabled={
                            status === currentStatus || isUpdatingStatus
                          }
                        >
                          {status}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>
          </div>

          {/* Grid Layout (Tetap 4 kolom, sesuaikan isi) */}
          <div className="lg:px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Informasi Pelanggan (Sama) */}
            <section className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-base font-semibold text-gray-800 py-2 border-b border-gray-200 mb-2">
                Informasi Pelanggan
              </h4>
              <dl className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FaUser className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Nama Pelanggan</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {sellRequest.customerName} {/* --- Ganti Variabel --- */}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaPhone className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Nomor Telepon</p>
                    <span className="text-gray-900 font-medium text-sm">
                      (+62){" "}
                      {formatNumberPhone(
                        sellRequest.customerPhoneNumber /* --- Ganti Variabel --- */
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaEnvelope className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Email</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {sellRequest.customerEmail} {/* --- Ganti Variabel --- */}
                    </span>
                  </div>
                </div>
              </dl>
            </section>

            {/* Informasi Mobil Dijual (Ganti dari Mobil Lama) */}
            <section className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-base font-semibold text-gray-800 py-2 border-b border-gray-200 mb-2">
                Informasi Mobil Dijual {/* --- GANTI TEKS --- */}
              </h4>
              <dl className="space-y-4">
                {/* Mobil Detail */}
                <div className="flex items-center space-x-2">
                  <FaCar className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Mobil Dijual</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {`${sellRequest.carBrand || ""} ${
                        sellRequest.carModel || ""
                      } ${sellRequest.carVariant || ""} ${
                        sellRequest.carYear || ""
                      }`.trim()}
                    </span>{" "}
                    {/* --- Ganti Fields --- */}
                  </div>
                </div>
                {/* Transmisi */}
                <div className="flex items-center space-x-2">
                  <GiGearStickPattern className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Transmisi</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {sellRequest.carTransmission || "-"}{" "}
                      {/* --- Ganti Field --- */}
                    </span>
                  </div>
                </div>
                {/* Warna */}
                <div className="flex items-center space-x-2">
                  <MdOutlineColorLens className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Warna</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {sellRequest.carColor || "-"} {/* --- Ganti Field --- */}
                    </span>
                  </div>
                </div>
                {/* Jarak Tempuh */}
                <div className="flex items-center space-x-2">
                  <FaRoad className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Jarak Tempuh</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {sellRequest.carTravelDistance /* --- Ganti Field --- */
                        ? `${sellRequest.carTravelDistance.toLocaleString(
                            "id-ID"
                          )} KM`
                        : "-"}
                    </span>
                  </div>
                </div>
                {/* STNK */}
                <div className="flex items-center space-x-2">
                  <FileCheck className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Masa Berlaku STNK</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {sellRequest.carStnkExpiry /* --- Ganti Field --- */
                        ? new Date(
                            sellRequest.carStnkExpiry
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
                  <FaMoneyBillWave className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Harga Penawaran</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {sellRequest.carPrice /* --- Ganti Field --- */
                        ? `Rp ${formatNumber(sellRequest.carPrice.toString())}`
                        : "-"}
                    </span>
                  </div>
                </div>
              </dl>
            </section>

            {/* --- HAPUS BAGIAN PREFERENSI MOBIL BARU --- */}
            {/* <section className="bg-gray-50 rounded-xl p-4"> ... </section> */}

            {/* Informasi Inspeksi (Sama, pastikan field inspeksi benar) */}
            <section className="bg-gray-50 rounded-xl p-4 lg:col-start-3 lg:col-span-2">
              {" "}
              {/* Adjust grid span if needed, or keep 4 cols */}
              <h4 className="text-base font-semibold text-gray-800 py-2 border-b border-gray-200 mb-2">
                Informasi Inspeksi
              </h4>
              <dl className="space-y-4">
                {/* Lokasi Type */}
                <div className="flex items-center space-x-2">
                  <FaLocationDot className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Lokasi Inspeksi</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {sellRequest.inspectionLocationType === "showroom"
                        ? "Showroom"
                        : sellRequest.inspectionLocationType === "home" // Check for 'home' explicitly if needed
                        ? "Rumah Pelanggan"
                        : sellRequest.inspectionLocationType || "-"}{" "}
                      {/* Fallback */}
                    </span>
                  </div>
                </div>

                {/* Alamat Detail (Showroom atau Rumah) */}
                {sellRequest.inspectionLocationType === "showroom" ? (
                  <div className="flex items-start space-x-2">
                    <FaMap className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs text-gray-700">Alamat Showroom</p>
                      <span className="text-gray-900 font-medium text-sm break-words">
                        {sellRequest.inspectionShowroomAddress || "-"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-2">
                    <FaMap className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs text-gray-700">
                        Alamat Lengkap Pelanggan
                      </p>
                      {(() => {
                        const fullAddress = `${
                          sellRequest.inspectionFullAddress || ""
                        }, ${sellRequest.inspectionCity || ""}, ${
                          sellRequest.inspectionProvince || ""
                        }`
                          .replace(/ ,|, $/g, "")
                          .trim();
                        if (!fullAddress)
                          return (
                            <span className="text-gray-900 font-medium text-sm">
                              -
                            </span>
                          );

                        const mapsUrl = `https://www.undefined.com/maps/search/?api=1&query=${encodeURIComponent(
                          fullAddress
                        )}`;
                        return (
                          <>
                            <p className="text-gray-900 font-medium text-sm break-words">
                              {fullAddress}
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-500 font-normal inline-flex items-center ml-1 space-x-1 hover:underline text-xs cursor-pointer"
                              >
                                <FaLocationDot />
                                <span>Lihat Peta Lokasi</span>
                              </a>
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Tanggal Inspeksi */}
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Tanggal Inspeksi</p>
                    <span className="text-gray-900 font-medium text-sm">
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
                {/* Waktu Inspeksi */}
                <div className="flex items-center space-x-2">
                  <FaClock className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Waktu Inspeksi</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {sellRequest.inspectionTime || "-"}
                    </span>
                  </div>
                </div>
              </dl>
            </section>
          </div>

          {/* Tombol Hubungi Pelanggan (Sama) */}
          <div className="flex justify-end space-x-2 sm:space-x-4 mt-12 lg:mt-8 lg:px-4">
            <button
              type="button"
              onClick={handleContactButtonClick}
              className={`flex items-center text-green-600 py-2.5 px-6 rounded-full focus:outline-none focus:shadow-outline border border-green-500 bg-green-50 hover:bg-green-100 cursor-pointer ${
                isUpdatingStatus ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isUpdatingStatus || !sellRequest.customerPhoneNumber} // Disable if no phone number
            >
              {/* Show loader only when updating status from Pending */}
              {isUpdatingStatus && currentStatus === "Pending" ? (
                <Loader2 size={20} className="animate-spin mr-2" />
              ) : (
                <FaWhatsapp size={20} className="mr-2" />
              )}
              <span className=" text-sm font-medium">Hubungi Pelanggan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuySellRequestDetail; // --- GANTI NAMA EXPORT ---
