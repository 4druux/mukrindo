// File: frontend/src/layout/admin/dashboard/TradeInRequestDetail.jsx
"use client";

import React, { useState, useRef } from "react";
import useSWR, { mutate } from "swr";
import axios from "axios";
import { useRouter } from "next/navigation";
import { formatNumberPhone } from "@/utils/formatNumberPhone";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import { motion, AnimatePresence } from "framer-motion";

// Import Icon
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

// Fetcher function for SWR
const fetcher = (url) => axios.get(url).then((res) => res.data);

// Base API endpoint
const API_BASE_URL = "http://localhost:5000/api/trade-in";

const TradeInRequestDetail = ({ requestId }) => {
  const router = useRouter();
  const apiUrl = `${API_BASE_URL}/${requestId}`;
  const {
    data: response,
    error,
    isLoading,
  } = useSWR(requestId ? apiUrl : null, fetcher);

  const [isDropdownStatusOpen, setIsDropdownStatusOpen] = useState({});
  const dropdownRefs = useRef({});

  const dropDownVariant = {
    open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  if (isLoading) {
    return <div className="text-center p-10">Memuat detail permintaan...</div>;
  }

  if (error) {
    console.error("Error fetching trade-in detail:", error);
    return (
      <div className="text-center p-10 text-red-600">
        Gagal memuat detail permintaan. ID: {requestId}
      </div>
    );
  }

  if (!response?.success || !response?.data) {
    return (
      <div className="text-center p-10 text-gray-600">
        Data permintaan tidak ditemukan.
      </div>
    );
  }

  const request = response.data;
  const statusOptions = [
    "Pending",
    "Contacted",
    "Scheduled",
    "Completed",
    "Cancelled",
  ];

  const breadcrumbItems = [
    { label: "Beranda", href: "/admin" },
    { label: "Tukar Tambah", href: "/admin/tukar-tambah" },
    { label: "Detail Permintaan", href: "" },
  ];

  return (
    <div className="">
      <BreadcrumbNav items={breadcrumbItems} />
      {/* Header */}
      <div className="lg:rounded-xl shadow-lg bg-white">
        <div
          className={`lg:rounded-t-xl ${
            request.status === "Pending"
              ? "bg-gradient-to-r from-orange-50 to-orange-200"
              : ""
          }`}
        >
          <div className="p-3 lg:p-5">
            <h3 className="text-md lg:text-lg leading-6 font-medium text-gray-700">
              Detail Permintaan Tukar Tambah
            </h3>
            <p className="flex item-start gap-2 mt-1">
              <span className="text-xs lg:text-sm text-gray-700">
                {" "}
                ID: {request._id}
              </span>
              <span
                className={` text-xs leading-5 font-semibold ${
                  request.status === "Pending"
                    ? "text-yellow-600  animate-pulse"
                    : request.status === "Contacted"
                    ? "text-blue-800  animate-pulse"
                    : request.status === "Scheduled"
                    ? "text-indigo-800  animate-pulse"
                    : request.status === "Completed"
                    ? "text-green-800"
                    : request.status === "Cancelled"
                    ? "text-red-800"
                    : "text-gray-800"
                }`}
              >
                {request.status || "N/A"}
              </span>
            </p>
          </div>
        </div>

        <div className="p-4 lg:p-6">
          <div className="flex flex-col items-end gap-2 justify-end">
            <p className="mt-1 text-xs  text-gray-700">
              Dibuat: {""}
              {new Date(request.createdAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <section className="flex justify-end">
              <AnimatePresence>
                <dd className="mt-1 text-sm text-gray-900 flex items-center gap-4">
                  <select
                    id="status"
                    name="status"
                    defaultValue={request.status}
                    className="block w-full max-w-xs rounded-full px-2 py-1 bg-white border-gray-300 shadow-sm focus:outline-none"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </dd>
              </AnimatePresence>
            </section>
          </div>
          <div className="lg:px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section>
              <h4 className="text-base font-semibold text-gray-800 py-2 border-b border-gray-200 mb-2">
                Informasi Pelanggan
              </h4>
              <dl className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FaUser className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700">Nama Pelanggan</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.customerName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <FaPhone className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700">Nomor Telepon</p>
                    <span className="text-gray-900 font-medium text-sm">
                      (+62) {formatNumberPhone(request.customerPhoneNumber)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <FaEnvelope className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700">Email</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.customerEmail}
                    </span>
                  </div>
                </div>
              </dl>
            </section>

            <section>
              <h4 className="text-base font-semibold text-gray-800 py-2 border-b border-gray-200 mb-2">
                Informasi Mobil Lama
              </h4>
              <dl className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FaCar className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700">Mobil Lama</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {`${request.tradeInBrand} ${request.tradeInModel}  ${request.tradeInVariant} (${request.tradeInYear})`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <GiGearStickPattern className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700">Transmisi</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.tradeInTransmission}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <MdOutlineColorLens className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700">Warna</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.tradeInColor}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <FaRoad className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700">Warna</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.tradeInTravelDistance.toLocaleString("id-ID")} KM
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <FileCheck className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700">Masa Berlaku STNK</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {new Date(request.tradeInStnkExpiry).toLocaleDateString(
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
              </dl>
            </section>

            <section>
              <h4 className="text-base font-semibold text-gray-800 py-2 border-b border-gray-200 mb-2">
                Preferensi Mobil Baru
              </h4>
              <dl className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FaCar className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700">Preferensi Mobil</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {`${request.newCarBrandPreference} ${request.newCarModelPreference}  ${request.newCarVariantPreference}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <GiGearStickPattern className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700">Transmisi</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.newCarTransmissionPreference}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <MdOutlineColorLens className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700">Warna</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.newCarColorPreference}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <IoIosPricetags className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700">Range Harga</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.newCarPriceRangePreference} jt
                    </span>
                  </div>
                </div>
              </dl>
            </section>

            <section>
              <h4 className="text-base font-semibold text-gray-800 py-2 border-b border-gray-200 mb-2">
                Informasi Inspeksi
              </h4>
              <dl className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FaLocationDot className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700">Lokasi Inspeksi</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.inspectionLocationType === "showroom"
                        ? "Showroom"
                        : "Rumah Pelanggan"}
                    </span>
                  </div>
                </div>

                {/* Detail Lokasi (Conditional) */}
                {request.inspectionLocationType === "showroom" ? (
                  <div className="flex items-center space-x-2">
                    <FaMap className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                    <div className="flex flex-col">
                      <p className="text-xs text-gray-700">Alamat Showroom</p>
                      <span className="text-gray-900 font-medium text-sm">
                        {request.inspectionShowroomAddress}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <FaMap className="text-gray-600 w-10 h-10 lg:w-14 lg:h-14" />
                      <div className="flex flex-col">
                        <p className="text-xs text-gray-700">
                          Alamat Lengkap Pelanggan
                        </p>
                        <span className="text-gray-900 font-medium text-sm">
                          {request.inspectionFullAddress}, {""}
                          {request.inspectionCity}, {""}
                          {request.inspectionProvince}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700">Tanggal Inspeksi</p>
                    <span className="text-gray-900 font-medium text-sm">
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
                  <FaClock className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700">Waktu Inspeksi</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {request.inspectionTime}
                    </span>
                  </div>
                </div>
              </dl>
            </section>
          </div>

          {/* --- Action Buttons --- */}
          <div className="flex justify-end space-x-2 sm:space-x-4 mt-12 lg:mt-8">
            <button
              type="button"
              onClick={() => router.back()} // Gunakan router.back()
              className="cursor-pointer border text-gray-500 border-gray-500 hover:bg-gray-50 hover:border-gray-700 hover:text-gray-700
             text-sm font-medium py-2.5 px-6 rounded-full focus:outline-none focus:shadow-outline"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={() => {
                if (request.customerPhoneNumber) {
                  const phone = request.customerPhoneNumber.startsWith("0")
                    ? "62" + request.customerPhoneNumber.substring(1)
                    : request.customerPhoneNumber.startsWith("62")
                    ? request.customerPhoneNumber
                    : "62" + request.customerPhoneNumber;
                  window.open(`https://wa.me/${phone}`, "_blank");
                } else {
                  alert("Nomor telepon pelanggan tidak tersedia.");
                }
              }}
              className="flex items-center text-green-600 py-2.5 px-6 rounded-full focus:outline-none focus:shadow-outline border border-green-500 bg-green-50 hover:bg-green-100 cursor-pointer"
            >
              <FaWhatsapp size={20} className="mr-2" />
              <span className=" text-sm font-medium">Hubungi Pelanggan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeInRequestDetail;
