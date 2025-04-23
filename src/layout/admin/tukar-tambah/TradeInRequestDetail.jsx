"use client";

import React, { useState, useEffect, useRef } from "react";
import useSWR, { mutate } from "swr";
import axios from "axios";
import { formatNumberPhone } from "@/utils/formatNumberPhone";
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
} from "react-icons/fa";
import { MdOutlineColorLens } from "react-icons/md";
import { GiGearStickPattern } from "react-icons/gi";
import { IoIosPricetags } from "react-icons/io";
import { FileCheck } from "lucide-react";
import { FaLocationDot } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

const fetcher = (url) => axios.get(url).then((res) => res.data);
const API_BASE_URL = "http://localhost:5000/api/trade-in";

const TradeInRequestDetail = ({
  requestId,
  onClose,
  mutateList,
  currentRequests,
}) => {
  const apiUrl = `${API_BASE_URL}/${requestId}`;
  const {
    data: response,
    error,
    isLoading,
  } = useSWR(requestId ? apiUrl : null, fetcher);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const statusOptions = ["Pending", "Contacted", "Completed", "Cancelled"];

  const dropDownVariant = {
    open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === currentStatus || isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    setIsDropdownOpen(false);

    try {
      const updateResponse = await axios.patch(`${API_BASE_URL}/${requestId}`, {
        status: newStatus,
      });

      if (updateResponse.data && updateResponse.data.success) {
        const updatedRequestData = updateResponse.data.data;
        setCurrentStatus(updatedRequestData.status);

        if (mutateList && currentRequests) {
          const requestIndex = currentRequests.findIndex(
            (req) => req._id === requestId
          );

          if (requestIndex !== -1) {
            const updatedRequests = [
              ...currentRequests.slice(0, requestIndex),
              {
                ...currentRequests[requestIndex],
                status: updatedRequestData.status,
              },
              ...currentRequests.slice(requestIndex + 1),
            ];

            mutateList(
              { success: true, data: updatedRequests },
              {
                revalidate: false,
              }
            );
          } else {
            console.warn(
              "Request yang diupdate tidak ditemukan di cache list. Memaksa revalidasi."
            );
            mutateList();
          }
        } else {
          console.warn(
            "mutateList atau currentRequests tidak tersedia. Memaksa revalidasi."
          );
          if (mutateList) mutateList();
        }

        toast.success("Status berhasil diperbarui!", {
          className: "custom-toast",
        });
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
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleContactButtonClick = async () => {
    if (currentStatus === "Pending" && !isUpdatingStatus) {
      try {
        await handleStatusUpdate("Contacted");
      } catch (error) {
        console.error("Gagal update status saat menghubungi:", error);

        return;
      }
    }

    if (request?.customerPhoneNumber) {
      const phone = request.customerPhoneNumber.startsWith("0")
        ? "62" + request.customerPhoneNumber.substring(1)
        : request.customerPhoneNumber.startsWith("62")
        ? request.customerPhoneNumber
        : "62" + request.customerPhoneNumber;

      const customerName = request.customerName || "Pelanggan";
      const companyName = "Mukrindo Motor";
      const inspectionDate = new Date(
        request.inspectionDate
      ).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const inspectionTime = request.inspectionTime;
      const inspectionLocation =
        request.inspectionLocationType === "showroom"
          ? `Showroom kami di ${request.inspectionShowroomAddress}`
          : `${request.inspectionFullAddress}, ${request.inspectionCity}, ${request.inspectionProvince}`;

      let message = `Halo Bapak/Ibu ${customerName},\n\n`;
      message += `Perkenalkan, Kami dari tim ${companyName}. Terima kasih sudah mengajukan permintaan tukar tambah yang Bapak/Ibu ajukan melalui website kami.\n\n`;
      message += `Kami ingin mengonfirmasi jadwal inspeksi mobil Bapak/Ibu yang telah dijadwalkan pada:\n`;
      message += `    • Tanggal: ${inspectionDate}\n`;
      message += `    • Waktu: ${inspectionTime}\n`;
      message += `    • Lokasi: ${inspectionLocation}\n\n`;
      message += `Mohon konfirmasi kesesuaian jadwal ini.\n\n`;
      message += `Jika ada pertanyaan lebih lanjut, jangan ragu untuk membalas pesan ini atau menghubungi kami.\n\n`;
      message += `Terima kasih, Hormat kami!\n`;
      message += `${companyName}`;

      const encodedMessage = encodeURIComponent(message);

      window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
    } else {
      toast.error("Nomor telepon pelanggan tidak tersedia.");
    }
  };

  useEffect(() => {
    if (response?.data?.status && currentStatus === null) {
      setCurrentStatus(response.data.status);
    }
  }, [response, currentStatus]);

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

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center p-10">
        Memuat detail permintaan...
      </div>
    );
  }

  if (error) {
    console.error("Error fetching trade-in detail:", error);
    return (
      <div className="flex-grow flex items-center justify-center p-10 text-red-600">
        Gagal memuat detail permintaan. ID: {requestId}
      </div>
    );
  }

  if (!response?.success || !response?.data) {
    return (
      <div className="flex-grow flex items-center justify-center p-10 text-gray-600">
        Data permintaan tidak ditemukan.
      </div>
    );
  }

  const request = response.data;
  if (currentStatus === null && request.status) {
    setCurrentStatus(request.status);
  }

  return (
    <div className="flex flex-col flex-grow h-full">
      <div
        className={`sticky top-0 z-10 flex-shrink-0 ${
          currentStatus === "Pending"
            ? "bg-gradient-to-r from-yellow-50 to-yellow-300"
            : currentStatus === "Contacted"
            ? "bg-gradient-to-r from-blue-50 to-blue-300"
            : currentStatus === "Completed"
            ? "bg-gradient-to-r from-green-50 to-green-300"
            : currentStatus === "Cancelled"
            ? "bg-gradient-to-r from-red-50 to-red-300"
            : "bg-gradient-to-r from-gray-50 to-gray-300"
        }`}
      >
        <div className="p-3 lg:p-4 flex justify-between items-center">
          <div className="flex gap-3">
            <h2 className="text-sm lg:text-lg leading-6 font-semibold text-gray-700">
              Detail Permintaan Tukar Tambah
            </h2>
            <div className="block lg:hidden">
              <span
                className={`px-2 inline-flex text-[10px] leading-5 font-semibold rounded-full w-fit ${
                  currentStatus === "Pending"
                    ? "bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-700 animate-pulse"
                    : currentStatus === "Contacted"
                    ? "bg-gradient-to-r from-blue-200 to-blue-300 text-blue-700 animate-pulse"
                    : currentStatus === "Completed"
                    ? "bg-gradient-to-r from-green-200 to-green-300 text-green-700 animate-pulse"
                    : currentStatus === "Cancelled"
                    ? "bg-gradient-to-r from-red-200 to-red-300 text-red-700 animate-pulse"
                    : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 animate-pulse"
                }`}
              >
                {currentStatus || "N/A"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
            aria-label="Close detail"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        <div className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row justify-between items-end lg:items-start mb-4 lg:px-4">
            <div className="flex item-start gap-2">
              <span className="text-xs lg:text-sm text-gray-700 lg:mt-1">
                ID: {request._id}
              </span>
              <div className="hidden lg:block">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${
                    currentStatus === "Pending"
                      ? "bg-gradient-to-r from-yellow-50 to-yellow-300 text-yellow-700 animate-pulse"
                      : currentStatus === "Contacted"
                      ? "bg-gradient-to-r from-blue-50 to-blue-300 text-blue-700 animate-pulse"
                      : currentStatus === "Completed"
                      ? "bg-gradient-to-r from-green-50 to-green-300 text-green-700 animate-pulse"
                      : currentStatus === "Cancelled"
                      ? "bg-gradient-to-r from-red-50 to-red-300 text-red-700 animate-pulse"
                      : "bg-gradient-to-r from-gray-50 to-gray-300 text-gray-700 animate-pulse"
                  }`}
                >
                  {currentStatus || "N/A"}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1 relative" ref={dropdownRef}>
              <p className="text-xs text-gray-700">
                Dibuat: {""}
                {new Date(request.createdAt).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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
          <div className="lg:px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      {request.customerName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaPhone className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Nomor Telepon</p>
                    <span className="text-gray-900 font-medium text-sm">
                      (+62) {formatNumberPhone(request.customerPhoneNumber)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaEnvelope className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Email</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.customerEmail}
                    </span>
                  </div>
                </div>
              </dl>
            </section>

            <section className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-base font-semibold text-gray-800 py-2 border-b border-gray-200 mb-2">
                Informasi Mobil Lama
              </h4>
              <dl className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FaCar className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Mobil Lama</p>
                    <span className="text-gray-900 font-medium text-sm">{`${request.tradeInBrand} ${request.tradeInModel} ${request.tradeInVariant} ${request.tradeInYear}`}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <GiGearStickPattern className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Transmisi</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.tradeInTransmission}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MdOutlineColorLens className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Warna</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.tradeInColor}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaRoad className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Jarak Tempuh</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.tradeInTravelDistance.toLocaleString("id-ID")} KM
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FileCheck className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Masa Berlaku STNK</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {new Date(request.tradeInStnkExpiry).toLocaleDateString(
                        "id-ID",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )}
                    </span>
                  </div>
                </div>
              </dl>
            </section>

            <section className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-base font-semibold text-gray-800 py-2 border-b border-gray-200 mb-2">
                Preferensi Mobil Baru
              </h4>
              <dl className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FaCar className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Preferensi Mobil</p>
                    <span className="text-gray-900 font-medium text-sm">{`${request.newCarBrandPreference} ${request.newCarModelPreference} ${request.newCarVariantPreference}`}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <GiGearStickPattern className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Transmisi</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.newCarTransmissionPreference}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MdOutlineColorLens className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Warna</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.newCarColorPreference}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <IoIosPricetags className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Range Harga</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.newCarPriceRangePreference} jt
                    </span>
                  </div>
                </div>
              </dl>
            </section>

            <section className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-base font-semibold text-gray-800 py-2 border-b border-gray-200 mb-2">
                Informasi Inspeksi
              </h4>
              <dl className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FaLocationDot className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Lokasi Inspeksi</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.inspectionLocationType === "showroom"
                        ? "Showroom"
                        : "Rumah Pelanggan"}
                    </span>
                  </div>
                </div>
                {request.inspectionLocationType === "showroom" ? (
                  <div className="flex items-start space-x-2">
                    <FaMap className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs text-gray-700">Alamat Showroom</p>
                      <span className="text-gray-900 font-medium text-sm break-words">
                        {request.inspectionShowroomAddress}
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
                        const fullAddress = `${request.inspectionFullAddress}, ${request.inspectionCity}, ${request.inspectionProvince}`;
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
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
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Tanggal Inspeksi</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {new Date(request.inspectionDate).toLocaleDateString(
                        "id-ID",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaClock className="text-gray-600 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Waktu Inspeksi</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.inspectionTime}
                    </span>
                  </div>
                </div>
              </dl>
            </section>
          </div>

          <div className="flex justify-end space-x-2 sm:space-x-4 mt-12 lg:mt-8 lg:px-4">
            <button
              type="button"
              onClick={handleContactButtonClick}
              className={`flex items-center text-green-600 py-2.5 px-6 rounded-full focus:outline-none focus:shadow-outline border border-green-500 bg-green-50 hover:bg-green-100 cursor-pointer ${
                isUpdatingStatus ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isUpdatingStatus}
            >
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

export default TradeInRequestDetail;
