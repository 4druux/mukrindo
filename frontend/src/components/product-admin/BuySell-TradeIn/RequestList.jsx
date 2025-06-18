// src/components/product-admin/BuySell-TradeIn/RequestList.jsx

import React, { useRef } from "react";
import {
  FaPhone,
  FaWhatsapp,
  FaCar,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { Loader2 } from "lucide-react";
import { formatNumberPhone } from "@/utils/formatNumberPhone";
import { formatNumber } from "@/utils/formatNumber";
import { useSearchParams } from "next/navigation";
import { motion, useInView } from "framer-motion";

const AnimatedItem = ({ children, as: Component = "div", ...props }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const desktopItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const mobileItemVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const itemVariants =
    Component === "tr" ? desktopItemVariants : mobileItemVariants;

  const MotionComponent = motion[Component];

  return (
    <MotionComponent
      ref={ref}
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

const RequestList = ({
  requests,
  requestType,
  onRowClick,
  onContactClick,
  updatingStatusRequestId,
  getInspectionLocationText,
}) => {
  const searchParams = useSearchParams();
  const fromNotification = searchParams.get("fromNotification");
  const idParam = searchParams.get("id");

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-gradient-to-r from-yellow-50 to-yellow-300 text-yellow-700";
      case "Dihubungi":
        return "bg-gradient-to-r from-blue-50 to-blue-300 text-blue-700";
      case "Selesai":
        return "bg-gradient-to-r from-green-50 to-green-300 text-green-700";
      case "Dibatalkan":
        return "bg-gradient-to-r from-red-50 to-red-300 text-red-700";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-300 text-gray-700";
    }
  };

  return (
    <div>
      {/* Mobile View */}
      <div className="space-y-4 lg:space-y-0 lg:hidden px-2 pt-4 md:pt-0">
        {requests.map((request) => {
          const isUpdating = updatingStatusRequestId === request._id;
          const hasPhone = !!request.customerPhoneNumber;

          return (
            <AnimatedItem
              as="div"
              key={`mobile-${request._id}`}
              id={`request-${request._id}`}
              className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-4 cursor-pointer hover:bg-blue-50 transition-colors duration-150 ease-in-out ${
                fromNotification === "true" && idParam === request._id
                  ? "ring-1 ring-orange-500 !bg-orange-50"
                  : ""
              }`}
              onClick={() => onRowClick(request._id)}
            >
              {/* Konten kartu tidak berubah */}
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold text-gray-800 truncate pr-2">
                  {request.customerName || "-"}
                </span>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${getStatusBadgeClass(
                    request.status
                  )}`}
                >
                  {request.status || "N/A"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="flex items-center space-x-2">
                  <FaPhone className="text-gray-600 min-w-5 min-h-5" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Nomor Telepon</p>
                    <span className="text-gray-900 font-medium text-xs">
                      {hasPhone
                        ? `(+62) ${formatNumberPhone(
                            request.customerPhoneNumber
                          )}`
                        : "-"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaLocationDot className="text-gray-600 min-w-5 min-h-5" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Lokasi Inspeksi</p>
                    <span className="text-gray-900 font-medium text-xs">
                      {getInspectionLocationText(
                        request.inspectionLocationType
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaCar className="text-gray-600 min-w-5 min-h-5" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">
                      {requestType === "buySell"
                        ? "Mobil Dijual"
                        : "Mobil Lama"}
                    </p>
                    <span className="text-gray-900 font-medium text-xs">
                      {requestType === "buySell"
                        ? `${request.buySellBrand || ""} ${
                            request.buySellModel || ""
                          } ${request.buySellVariant || ""} (${
                            request.buySellYear || ""
                          })`.trim() || "-"
                        : `${request.tradeInBrand || ""} ${
                            request.tradeInModel || ""
                          } ${request.tradeInVariant || ""} (${
                            request.tradeInYear || ""
                          })`.trim() || "-"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-gray-600 min-w-5 min-h-5" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Tanggal Inspeksi</p>
                    <span className="text-gray-900 font-medium text-xs">
                      {request.inspectionDate
                        ? new Date(request.inspectionDate).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {requestType === "buySell" ? (
                    <FaMoneyBillWave className="text-gray-600 min-w-5 min-h-5" />
                  ) : (
                    <FaCar className="text-gray-600 min-w-5 min-h-5" />
                  )}
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">
                      {requestType === "buySell"
                        ? "Harga Penawaran"
                        : "Preferensi Mobil Baru"}
                    </p>
                    <span className="text-gray-900 font-medium text-xs">
                      {requestType === "buySell"
                        ? request.buySellPrice
                          ? `Rp ${formatNumber(
                              request.buySellPrice.toString()
                            )}`
                          : "-"
                        : `${request.tradeInNewBrand || ""} ${
                            request.tradeInNewModel || ""
                          }`.trim() || "-"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaClock className="text-gray-600 min-w-5 min-h-5" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Jam Inspeksi</p>
                    <span className="text-gray-900 font-medium text-xs">
                      {request.inspectionTime || "-"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={(e) => onContactClick(e, request)}
                  className={`p-2 rounded-full text-green-500 hover:bg-green-100 transition-colors ${
                    isUpdating || !hasPhone
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={isUpdating || !hasPhone}
                  aria-label="Hubungi via WhatsApp"
                >
                  {isUpdating ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <FaWhatsapp size={20} />
                  )}
                </button>
              </div>
            </AnimatedItem>
          );
        })}
      </div>

      {/* Desktop View */}
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
                {requestType === "buySell" ? "Mobil Dijual" : "Mobil Lama"}
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {requestType === "buySell"
                  ? "Harga Penawaran"
                  : "Preferensi Mobil"}
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
            {requests.map((request, index) => {
              const isUpdating = updatingStatusRequestId === request._id;
              const hasPhone = !!request.customerPhoneNumber;

              return (
                <AnimatedItem
                  as="tr"
                  key={`desktop-${request._id}`}
                  id={`request-${request._id}`}
                  className={`${
                    index % 2 === 1 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-50 cursor-pointer transition-colors duration-150 ease-in-out ${
                    fromNotification === "true" && idParam === request._id
                      ? "!bg-orange-50 !border-l-3 border-b-0 !border-orange-500"
                      : ""
                  }`}
                  onClick={() => onRowClick(request._id)}
                >
                  <td className="px-3 py-4 text-xs font-medium text-gray-900 whitespace-normal break-words">
                    {request.customerName || "-"}
                  </td>
                  <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                    {hasPhone
                      ? `(+62) ${formatNumberPhone(
                          request.customerPhoneNumber
                        )}`
                      : "-"}
                  </td>
                  <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                    {requestType === "buySell"
                      ? `${request.buySellBrand || ""} ${
                          request.buySellModel || ""
                        } (${request.buySellYear || ""})`.trim() || "-"
                      : `${request.tradeInBrand || ""} ${
                          request.tradeInModel || ""
                        } (${request.tradeInYear || ""})`.trim() || "-"}
                  </td>
                  <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                    {requestType === "buySell"
                      ? request.buySellPrice
                        ? `Rp ${formatNumber(request.buySellPrice.toString())}`
                        : "-"
                      : `${request.tradeInNewBrand || ""} ${
                          request.tradeInNewModel || ""
                        }`.trim() || "-"}
                  </td>
                  <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                    {getInspectionLocationText(request.inspectionLocationType)}
                  </td>
                  <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                    {request.inspectionDate
                      ? new Date(request.inspectionDate).toLocaleDateString(
                          "id-ID",
                          { day: "2-digit", month: "short", year: "numeric" }
                        )
                      : "-"}
                  </td>
                  <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                    {request.inspectionTime || "-"}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        request.status
                      )}`}
                    >
                      {request.status || "N/A"}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-xs font-medium text-center">
                    <button
                      type="button"
                      onClick={(e) => onContactClick(e, request)}
                      className={`text-green-500 hover:text-green-700 transition-colors inline-block cursor-pointer ${
                        isUpdating || !hasPhone
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={isUpdating || !hasPhone}
                      aria-label="Hubungi via WhatsApp"
                    >
                      {isUpdating ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <FaWhatsapp size={20} />
                      )}
                    </button>
                  </td>
                </AnimatedItem>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestList;
