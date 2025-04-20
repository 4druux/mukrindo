// File: frontend/src/layout/admin/dashboard/TradeInRequestDetail.jsx
"use client";

import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import axios from "axios";
import { FaWhatsapp } from "react-icons/fa";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import { useRouter } from "next/navigation";
import { formatNumberPhone } from "@/utils/formatNumberPhone";

// Fetcher function for SWR
const fetcher = (url) => axios.get(url).then((res) => res.data);

// Base API endpoint
const API_BASE_URL = "http://localhost:5000/api/trade-in";

const TradeInRequestDetail = ({ requestId }) => {
  const router = useRouter(); // Initialize router
  const apiUrl = `${API_BASE_URL}/${requestId}`;
  const {
    data: response,
    error,
    isLoading,
  } = useSWR(requestId ? apiUrl : null, fetcher); // Only fetch if requestId exists

  // Helper untuk menentukan apakah baris genap/ganjil untuk styling
  // Dibuat sebagai fungsi agar bisa di-reset per section jika perlu
  const createRowIndexer = () => {
    let index = 0;
    return () => index++ % 2 !== 0;
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

  const isEvenCustomerRow = createRowIndexer();
  const isEvenOldCarRow = createRowIndexer();
  const isEvenInspectionRow = createRowIndexer();
  const isEvenNewCarRow = createRowIndexer();

  return (
    <div className="">
      <BreadcrumbNav items={breadcrumbItems} />
      <div className="lg:p-6 rounded-xl shadow-lg bg-white">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl leading-6 font-medium text-gray-900">
            Detail Permintaan Tukar Tambah
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            ID Permintaan: {request._id}
          </p>

          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Dibuat:{" "}
            {new Date(request.createdAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Body dengan Sections */}
        <div className="border-t border-gray-200">
          {/* --- Customer Info Section --- */}
          <section className="mb-6">
            <h4 className="text-base font-semibold text-gray-800 px-4 py-3 sm:px-6 bg-gray-100 border-b border-gray-200">
              Informasi Pelanggan
            </h4>
            <dl>
              {/* Nama Pelanggan */}
              <div
                className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                  isEvenCustomerRow() ? "bg-gray-50" : ""
                }`}
              >
                <dt className="text-sm font-semibold text-gray-600">
                  Nama Pelanggan
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {request.customerName || "-"}
                </dd>
              </div>
              {/* No. Telepon */}
              <div
                className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                  isEvenCustomerRow() ? "bg-gray-50" : ""
                }`}
              >
                <dt className="text-sm font-semibold text-gray-600">
                  No. Telepon
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {request.customerPhoneNumber
                    ? `(+62) ${formatNumberPhone(request.customerPhoneNumber)}`
                    : "-"}
                </dd>
              </div>
              {/* Email */}
              <div
                className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                  isEvenCustomerRow() ? "bg-gray-50" : ""
                }`}
              >
                <dt className="text-sm font-semibold text-gray-600">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {request.customerEmail || "-"}
                </dd>
              </div>
            </dl>
          </section>

          {/* --- Grid Container for Old Car and New Car Preference --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-6">
            {/* --- Old Car Info Section --- */}
            <section className="mb-6">
              <h4 className="text-base font-semibold text-gray-800 px-4 py-3 sm:px-6 bg-gray-100 border-t border-b border-gray-200">
                Informasi Mobil Lama
              </h4>
              <dl>
                {/* Mobil Lama */}
                <div
                  className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                    isEvenOldCarRow() ? "bg-gray-50" : ""
                  }`}
                >
                  <dt className="text-sm font-semibold text-gray-600">
                    Mobil Lama
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {`${request.tradeInBrand} ${request.tradeInModel} (${request.tradeInYear})` ||
                      "-"}
                  </dd>
                </div>
                {/* Varian */}
                <div
                  className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                    isEvenOldCarRow() ? "bg-gray-50" : ""
                  }`}
                >
                  <dt className="text-sm font-semibold text-gray-600">
                    Varian
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {request.tradeInVariant || "-"}
                  </dd>
                </div>
                {/* Transmisi */}
                <div
                  className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                    isEvenOldCarRow() ? "bg-gray-50" : ""
                  }`}
                >
                  <dt className="text-sm font-semibold text-gray-600">
                    Transmisi
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {request.tradeInTransmission || "-"}
                  </dd>
                </div>
                {/* Warna */}
                <div
                  className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                    isEvenOldCarRow() ? "bg-gray-50" : ""
                  }`}
                >
                  <dt className="text-sm font-semibold text-gray-600">Warna</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {request.tradeInColor || "-"}
                  </dd>
                </div>
                {/* Jarak Tempuh */}
                <div
                  className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                    isEvenOldCarRow() ? "bg-gray-50" : ""
                  }`}
                >
                  <dt className="text-sm font-semibold text-gray-600">
                    Jarak Tempuh (km)
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {request.tradeInTravelDistance?.toLocaleString("id-ID") ||
                      "-"}
                  </dd>
                </div>
                {/* Masa Berlaku STNK */}
                <div
                  className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                    isEvenOldCarRow() ? "bg-gray-50" : ""
                  }`}
                >
                  <dt className="text-sm font-semibold text-gray-600">
                    Masa Berlaku STNK
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(request.tradeInStnkExpiry).toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            {/* --- New Car Preference Section --- */}
            <section className="mb-6">
              <h4 className="text-base font-semibold text-gray-800 px-4 py-3 sm:px-6 bg-gray-100 border-t border-b border-gray-200">
                Preferensi Mobil Baru
              </h4>
              <dl>
                {/* Preferensi Mobil Baru */}
                <div
                  className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                    isEvenNewCarRow() ? "bg-gray-50" : ""
                  }`}
                >
                  <dt className="text-sm font-semibold text-gray-600">
                    Preferensi Mobil Baru
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {`${request.newCarBrandPreference || ""} ${
                      request.newCarModelPreference || ""
                    }`.trim() || "-"}
                  </dd>
                </div>
                {/* Varian */}
                <div
                  className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                    isEvenNewCarRow() ? "bg-gray-50" : ""
                  }`}
                >
                  <dt className="text-sm font-semibold text-gray-600">
                    Varian
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {request.newCarVariantPreference || "-"}
                  </dd>
                </div>
                {/* Transmisi */}
                <div
                  className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                    isEvenNewCarRow() ? "bg-gray-50" : ""
                  }`}
                >
                  <dt className="text-sm font-semibold text-gray-600">
                    Transmisi
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {request.newCarTransmissionPreference || "-"}
                  </dd>
                </div>
                {/* Warna */}
                <div
                  className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                    isEvenNewCarRow() ? "bg-gray-50" : ""
                  }`}
                >
                  <dt className="text-sm font-semibold text-gray-600">Warna</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {request.newCarColorPreference || "-"}
                  </dd>
                </div>
                {/* Rentang Harga */}
                <div
                  className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                    isEvenNewCarRow() ? "bg-gray-50" : ""
                  }`}
                >
                  <dt className="text-sm font-semibold text-gray-600">
                    Rentang Harga
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {request.newCarPriceRangePreference
                      ? `${request.newCarPriceRangePreference} jt`
                      : "-"}{" "}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
          {/* --- End Grid Container --- */}

          {/* --- Inspection Info Section --- */}
          <section className="mb-6">
            <h4 className="text-base font-semibold text-gray-800 px-4 py-3 sm:px-6 bg-gray-100 border-t border-b border-gray-200">
              Informasi Inspeksi
            </h4>
            <dl>
              {/* Lokasi Inspeksi */}
              <div
                className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                  isEvenInspectionRow() ? "bg-gray-50" : ""
                }`}
              >
                <dt className="text-sm font-semibold text-gray-600">
                  Lokasi Inspeksi
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {request.inspectionLocationType === "showroom"
                    ? "Showroom"
                    : "Rumah Pelanggan" || "-"}
                </dd>
              </div>
              {/* Detail Lokasi (Conditional) */}
              {request.inspectionLocationType === "showroom" ? (
                <div
                  className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                    isEvenInspectionRow() ? "bg-gray-50" : ""
                  }`}
                >
                  <dt className="text-sm font-semibold text-gray-600">
                    Alamat Showroom
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {request.inspectionShowroomAddress || "-"}
                  </dd>
                </div>
              ) : (
                <>
                  <div
                    className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                      isEvenInspectionRow() ? "bg-gray-50" : ""
                    }`}
                  >
                    <dt className="text-sm font-semibold text-gray-600">
                      Provinsi
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {request.inspectionProvince || "-"}
                    </dd>
                  </div>
                  <div
                    className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                      isEvenInspectionRow() ? "bg-gray-50" : ""
                    }`}
                  >
                    <dt className="text-sm font-semibold text-gray-600">
                      Kota/Kabupaten
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {request.inspectionCity || "-"}
                    </dd>
                  </div>
                  <div
                    className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                      isEvenInspectionRow() ? "bg-gray-50" : ""
                    }`}
                  >
                    <dt className="text-sm font-semibold text-gray-600">
                      Alamat Lengkap
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {request.inspectionFullAddress || "-"}
                    </dd>
                  </div>
                </>
              )}
              {/* Tanggal Inspeksi */}
              <div
                className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                  isEvenInspectionRow() ? "bg-gray-50" : ""
                }`}
              >
                <dt className="text-sm font-semibold text-gray-600">
                  Tanggal Inspeksi
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(request.inspectionDate).toLocaleDateString(
                    "id-ID",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </dd>
              </div>
              {/* Waktu Inspeksi */}
              <div
                className={`py-3 sm:py-4 px-4 sm:px-6 sm:grid sm:grid-cols-3 sm:gap-4 ${
                  isEvenInspectionRow() ? "bg-gray-50" : ""
                }`}
              >
                <dt className="text-sm font-semibold text-gray-600">
                  Waktu Inspeksi
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {request.inspectionTime || "-"}
                </dd>
              </div>
            </dl>
          </section>

          {/* --- Status Section (Diabaikan sesuai permintaan) --- */}
          <section>
            <h4 className="text-base font-semibold text-gray-800 px-4 py-3 sm:px-6 bg-gray-100 border-t border-b border-gray-200">
              Status Permintaan
            </h4>
            <div className="px-4 py-5 sm:px-6">
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                <dt className="text-sm font-semibold text-gray-600">
                  Update Status
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center gap-4">
                  <select
                    id="status"
                    name="status"
                    defaultValue={request.status || "Pending"} // Set default value based on data
                    className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:opacity-70 disabled:bg-gray-100"
                    // disabled // Anda bisa uncomment ini jika ingin disable sementara
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  {/* Logika untuk update status belum ditambahkan */}
                </dd>
              </div>
            </div>
          </section>

          {/* --- Action Buttons --- */}
          <div className="flex justify-end space-x-2 sm:space-x-4 mt-6 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => router.back()} // Gunakan router.back()
              className="cursor-pointer border text-gray-500 border-gray-500 hover:bg-gray-50 hover:border-gray-700 hover:text-gray-700
             text-sm font-medium py-2.5 px-6 rounded-full focus:outline-none focus:shadow-outline"
            >
              Kembali
            </button>
            <button
              type="button" // Ubah ke type="button" jika belum ada fungsi submit
              onClick={() => {
                // Logika untuk membuka WhatsApp (contoh)
                if (request.customerPhoneNumber) {
                  const phone = request.customerPhoneNumber.startsWith("0")
                    ? "62" + request.customerPhoneNumber.substring(1)
                    : request.customerPhoneNumber.startsWith("62")
                    ? request.customerPhoneNumber
                    : "62" + request.customerPhoneNumber; // Basic normalization
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
            {/* Tombol Simpan Status bisa ditambahkan di sini jika diperlukan nanti */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeInRequestDetail;
