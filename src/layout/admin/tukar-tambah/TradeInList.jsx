"use client";

import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import axios from "axios";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import Pagination from "@/components/global/Pagination";
import {
  FaPhone,
  FaWhatsapp,
  FaCar,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { formatNumberPhone } from "@/utils/formatNumberPhone";
import TradeInRequestDetail from "./TradeInRequestDetail";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const API_ENDPOINT = "http://localhost:5000/api/trade-in";
const REQUESTS_PER_PAGE = 10;

const TradeInList = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const {
    data: response,
    error,
    isLoading,
    mutate: mutateList,
  } = useSWR(API_ENDPOINT, fetcher, {
    revalidateOnFocus: true,
  });

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

  const requests = response?.data || [];

  const pageCount = Math.ceil(requests.length / REQUESTS_PER_PAGE);
  const indexOfLastRequest = (currentPage + 1) * REQUESTS_PER_PAGE;
  const indexOfFirstRequest = indexOfLastRequest - REQUESTS_PER_PAGE;
  const currentRequests = requests.slice(
    indexOfFirstRequest,
    indexOfLastRequest
  );

  const handlePageChange = (data) => {
    setCurrentPage(data.selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const breadcrumbItems = [
    { label: "Beranda", href: "/admin" },
    { label: "Tukar Tambah", href: "" },
  ];

  const handleContactFromList = async (e, request) => {
    e.stopPropagation();
    const requestId = request._id;
    const currentStatus = request.status;
    const phoneNumber = request.customerPhoneNumber;

    if (!phoneNumber) {
      toast.error("Nomor telepon pelanggan tidak tersedia.");
      return;
    }

    if (currentStatus === "Pending") {
      setUpdatingStatusId(requestId);
      try {
        const updateResponse = await axios.patch(
          `${API_ENDPOINT}/${requestId}`,
          {
            status: "Contacted",
          }
        );

        if (updateResponse.data && updateResponse.data.success) {
          const updatedRequests = requests.map((req) =>
            req._id === requestId ? { ...req, status: "Contacted" } : req
          );
          mutateList({ success: true, data: updatedRequests }, false);

          toast.success("Status berhasil diperbarui!", {
            className: "custom-toast",
          });

          openWhatsApp(request);
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
        setUpdatingStatusId(null);
      }
    } else {
      openWhatsApp(request);
    }
  };

  const openWhatsApp = (request) => {
    if (request.customerPhoneNumber) {
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
    }
  };

  const handleRowClick = (requestId) => {
    setSelectedRequestId(requestId);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequestId(null);
    document.body.style.overflow = "auto";
  };

  const getInspectionLocationText = (locationType) => {
    if (!locationType) return "-";
    return locationType === "showroom" ? "Showroom" : "Rumah Pelanggan";
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

  return (
    <div>
      <BreadcrumbNav items={breadcrumbItems} />

      <div className="lg:p-6 rounded-xl shadow-lg bg-white">
        <h2 className="text-sm lg:text-lg leading-6 font-semibold text-gray-700 mb-4">
          Permintaan Tukar Tambah Terbaru
        </h2>

        {requests.length === 0 ? (
          <p className="text-center text-gray-500">
            Belum ada permintaan tukar tambah.
          </p>
        ) : (
          <>
            {/* Mobile View */}
            <div className="space-y-4 lg:space-y-0 lg:hidden">
              {currentRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 cursor-pointer hover:bg-blue-50 transition-colors duration-150 ease-in-out"
                  onClick={() => handleRowClick(request._id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-semibold text-gray-800 truncate pr-2">
                      {request.customerName || "-"}
                    </span>
                    {/* Status Badge */}
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${
                        request.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : request.status === "Contacted"
                          ? "bg-blue-100 text-blue-800"
                          : request.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : request.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {request.status || "N/A"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-2">
                    <div className="flex items-center space-x-2">
                      <FaPhone className="text-gray-600 w-5 h-5" />
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs text-gray-700">Nomor Telepon</p>
                        <span className="text-gray-900 font-medium text-xs">
                          {request.customerPhoneNumber
                            ? `(+62) ${formatNumberPhone(
                                request.customerPhoneNumber
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
                          {`${request.newCarBrandPreference || ""} ${
                            request.newCarModelPreference || ""
                          }`.trim() || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FaCar className="text-gray-600 w-5 h-5" />
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs text-gray-700">Mobil Lama</p>
                        <span className="text-gray-900 font-medium text-xs">{`${request.tradeInBrand} ${request.tradeInModel} ${request.tradeInVariant} ${request.tradeInYear}`}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-gray-600 w-5 h-5" />
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs text-gray-700">
                          Tanggal Inspeksi
                        </p>
                        <span className="text-gray-900 font-medium text-xs">
                          {new Date(request.inspectionDate).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
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
                          {`${request.newCarBrandPreference || ""} ${
                            request.newCarModelPreference || ""
                          }`.trim() || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FaClock className="text-gray-600 w-5 h-5" />
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs text-gray-700">Jam Inspeksi</p>
                        <span className="text-gray-900 font-medium text-xs">
                          {request.inspectionTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    {/* Tombol WhatsApp */}
                    <button
                      type="button"
                      onClick={(e) => handleContactFromList(e, request)}
                      className={`p-2 rounded-full text-green-500 hover:bg-green-100 transition-colors ${
                        updatingStatusId === request._id ||
                        !request.customerPhoneNumber
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={
                        updatingStatusId === request._id ||
                        !request.customerPhoneNumber
                      }
                      aria-label="Hubungi via WhatsApp"
                    >
                      {updatingStatusId === request._id ? (
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
                  {currentRequests.map((request, index) => (
                    <tr
                      key={request._id}
                      onClick={() => handleRowClick(request._id)}
                      className={`
                      ${index % 2 === 1 ? "bg-gray-50" : "bg-white"}
                      hover:bg-blue-50 cursor-pointer transition-colors duration-150 ease-in-out`}
                    >
                      <td className="px-3 py-4 text-xs font-medium text-gray-900 whitespace-normal break-words">
                        {request.customerName || "-"}
                      </td>
                      <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                        {request.customerPhoneNumber
                          ? `(+62) ${formatNumberPhone(
                              request.customerPhoneNumber
                            )}`
                          : "-"}
                      </td>
                      <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                        {`${request.tradeInBrand || ""} ${
                          request.tradeInModel || ""
                        } (${request.tradeInYear || ""})`.trim() || "-"}
                      </td>
                      <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                        {`${request.newCarBrandPreference || ""} ${
                          request.newCarModelPreference || ""
                        }`.trim() || "-"}
                      </td>
                      <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                        {getInspectionLocationText(
                          request.inspectionLocationType
                        )}
                      </td>
                      <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                        {new Date(request.inspectionDate).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>

                      <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                        {request.inspectionTime}
                      </td>

                      <td className="px-2 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            request.status === "Pending"
                              ? "bg-gradient-to-r from-yellow-50 to-yellow-300 text-yellow-700"
                              : request.status === "Contacted"
                              ? "bg-gradient-to-r from-blue-50 to-blue-300 text-blue-700"
                              : request.status === "Completed"
                              ? "bg-gradient-to-r from-green-50 to-green-300 text-green-700"
                              : request.status === "Cancelled"
                              ? "bg-gradient-to-r from-red-50 to-red-300 text-red-700"
                              : "bg-gradient-to-r from-gray-50 to-gray-300 text-gray-700"
                          }`}
                        >
                          {request.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-xs font-medium text-center">
                        <button
                          type="button"
                          onClick={(e) => handleContactFromList(e, request)}
                          className={`text-green-500 hover:text-green-700 transition-colors inline-block cursor-pointer ${
                            updatingStatusId === request._id ||
                            !request.customerPhoneNumber
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={
                            updatingStatusId === request._id ||
                            !request.customerPhoneNumber
                          }
                          aria-label="Hubungi via WhatsApp"
                        >
                          {updatingStatusId === request._id ? (
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

            {pageCount > 1 && (
              <div className="mt-6">
                <Pagination
                  pageCount={pageCount}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && selectedRequestId && (
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
                  requestId={selectedRequestId}
                  onClose={handleCloseModal}
                  mutateList={mutateList}
                  currentRequests={requests}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TradeInList;
