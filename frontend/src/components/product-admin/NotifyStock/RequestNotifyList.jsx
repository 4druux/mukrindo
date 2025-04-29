// src/components/product-admin/NotifyStock/RequestNotifyList.js
import React from "react";
import { FaPhone, FaWhatsapp, FaCar, FaCalendarAlt } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { formatNumberPhone } from "@/utils/formatNumberPhone";

const RequestNotifyList = ({
  requests,
  onRowClick,
  onContactClick,
  updatingStatusRequestId,
}) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-gradient-to-r from-yellow-50 to-yellow-300 text-yellow-700";
      case "Dihubungi":
        return "bg-gradient-to-r from-green-50 to-green-300 text-green-700";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-300 text-gray-700";
    }
  };

  return (
    <div className="lg:p-6 rounded-xl lg:shadow-lg lg:bg-white px-2">
      {/* Mobile View */}
      <div className="space-y-4 lg:space-y-0 lg:hidden">
        {requests.map((request) => {
          const isUpdating = updatingStatusRequestId === request._id;
          const hasPhone = !!request.phoneNumber;

          return (
            <div
              key={request._id}
              className="bg-white border border-gray-200 rounded-2xl shadow-md p-4 cursor-pointer hover:bg-blue-50 transition-colors duration-150 ease-in-out"
              onClick={() => onRowClick(request._id)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold text-gray-800 truncate pr-2">
                  {`${request.brand || ""} ${request.model || ""} (${
                    request.year || ""
                  })`.trim() || "-"}
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
                  <FaPhone className="text-gray-600 min-w-5 min-h-5 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Nomor Telepon</p>
                    <span className="text-gray-900 font-medium text-xs">
                      {hasPhone
                        ? `(+62) ${formatNumberPhone(request.phoneNumber)}`
                        : "-"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <FaCar className="text-gray-600 min-w-5 min-h-5 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Mobil Dicari</p>
                    <span className="text-gray-900 font-medium text-xs">
                      {`${request.brand || ""} ${request.model || ""} (${
                        request.year || ""
                      })`.trim() || "-"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 col-span-2">
                  <FaCalendarAlt className="text-gray-600 min-w-5 min-h-5 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-gray-700">Tanggal Permintaan</p>
                    <span className="text-gray-900 font-medium text-xs">
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tombol Aksi (Hubungi) */}
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContactClick(e, request);
                  }}
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
            </div>
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
                Mobil Dicari
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
                Tanggal Permintaan
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Hubungi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((request, index) => {
              const isUpdating = updatingStatusRequestId === request._id;
              const hasPhone = !!request.phoneNumber;

              return (
                <tr
                  key={request._id}
                  onClick={() => onRowClick(request._id)}
                  className={`${
                    index % 2 === 1 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-50 cursor-pointer transition-colors duration-150 ease-in-out`}
                >
                  <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                    {`${request.brand || ""} ${request.model || ""} (${
                      request.year || ""
                    })`.trim() || "-"}
                  </td>
                  <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                    {hasPhone
                      ? `(+62) ${formatNumberPhone(request.phoneNumber)}`
                      : "-"}
                  </td>
                  <td className="px-3 py-4 text-xs text-gray-600 whitespace-normal break-words">
                    {request.createdAt
                      ? new Date(request.createdAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "-"}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onContactClick(e, request);
                      }}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestNotifyList;
