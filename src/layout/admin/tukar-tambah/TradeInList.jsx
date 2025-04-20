// File: frontend/src/layout/admin/dashboard/TradeInList.jsx
"use client";

import React, { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { useRouter } from "next/navigation";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import Pagination from "@/components/global/Pagination";
import { FaWhatsapp } from "react-icons/fa";
import { formatNumberPhone } from "@/utils/formatNumberPhone";

// Fetcher function untuk SWR
const fetcher = (url) => axios.get(url).then((res) => res.data);

// Sesuaikan dengan endpoint backend Anda
const API_ENDPOINT = "http://localhost:5000/api/trade-in";
const REQUESTS_PER_PAGE = 10;

const TradeInList = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();

  const {
    data: response,
    error,
    isLoading,
  } = useSWR(API_ENDPOINT, fetcher, {
    revalidateOnFocus: true,
  });

  // Handle Loading State
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

  // Handle Error State
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

  // Logic Pagination
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

  // Fungsi untuk format nomor WhatsApp
  const formatWhatsAppNumber = (phoneNumber) => {
    if (!phoneNumber) return ""; // Handle null or undefined phone number
    let cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
    if (cleanNumber.startsWith("0")) {
      cleanNumber = cleanNumber.substring(1);
    }
    if (!cleanNumber.startsWith("62")) {
      cleanNumber = `62${cleanNumber}`;
    }
    return cleanNumber;
  };

  // Fungsi untuk navigasi ke detail
  const handleRowClick = (requestId) => {
    router.push(`/admin/tukar-tambah/${requestId}`);
  };

  // Fungsi untuk mendapatkan teks lokasi inspeksi
  const getInspectionLocationText = (locationType) => {
    if (!locationType) return "-"; // Handle null or undefined
    return locationType === "showroom" ? "Showroom" : "Rumah Pelanggan";
  };

  return (
    <div>
      <BreadcrumbNav items={breadcrumbItems} />

      <div className="p-6 rounded-xl shadow-lg bg-white">
        <h2 className="text-xl font-medium mb-4 text-gray-700">
          Permintaan Tukar Tambah Terbaru
        </h2>

        {requests.length === 0 ? (
          <p className="text-center text-gray-500">
            Belum ada permintaan tukar tambah.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tanggal Masuk
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Nama Pelanggan
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      No. Telepon
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Mobil Lama
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Preferensi Mobil Baru
                    </th>
                    {/* --- Kolom Baru Ditambahkan --- */}
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Lokasi Inspeksi
                    </th>
                    {/* --- Akhir Kolom Baru --- */}
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="relative px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                        hover:bg-blue-50 // Ganti hover ke biru muda
                        cursor-pointer
                        transition-colors duration-150 ease-in-out
                      `}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(request.createdAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.customerName || "-"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {request.customerPhoneNumber
                          ? `(+62) ${formatNumberPhone(
                              request.customerPhoneNumber
                            )}`
                          : "-"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {`${request.tradeInBrand || ""} ${
                          request.tradeInModel || ""
                        } (${request.tradeInYear || ""})`.trim() || "-"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {`${request.newCarBrandPreference || ""} ${
                          request.newCarModelPreference || ""
                        }`.trim() || "-"}
                      </td>
                      {/* --- Sel Data Baru Ditambahkan --- */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getInspectionLocationText(
                          request.inspectionLocationType
                        )}
                      </td>
                      {/* --- Akhir Sel Data Baru --- */}
                      <td className="px-2 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            request.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.status === "Contacted"
                              ? "bg-blue-100 text-blue-800"
                              : request.status === "Scheduled"
                              ? "bg-indigo-100 text-indigo-800"
                              : request.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : request.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {request.status || "N/A"}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-medium">
                        <a
                          href={`https://wa.me/${formatWhatsAppNumber(
                            request.customerPhoneNumber
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Hubungi via WhatsApp"
                          onClick={(e) => e.stopPropagation()} // Mencegah trigger handleRowClick
                          className="text-green-500 hover:text-green-700 transition-colors inline-block"
                        >
                          <FaWhatsapp size={20} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Render Pagination */}
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
    </div>
  );
};

export default TradeInList;
