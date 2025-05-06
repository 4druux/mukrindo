// src/components/global/CarProductModernNoHelper.jsx
import React from "react";

// Import Icon (asumsi ikon yang sama masih relevan)
import { BsFuelPumpFill } from "react-icons/bs";
import { GiGearStickPattern } from "react-icons/gi";
import { FaRegCalendarAlt, FaRoad } from "react-icons/fa";
import { MdOutlineColorLens } from "react-icons/md";
import { CheckCircle, FileCheck, XCircle } from "lucide-react";

const CarProductModernNoHelper = ({ product, isAdminRoute = false }) => {
  if (!product) {
    return null;
  }

  // Helper function for formatting date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      month: "long", // Use long month name for clarity
      year: "numeric",
    });
  };

  // Helper function for formatting currency/number
  const formatNumber = (number) => {
    return number.toLocaleString("id-ID");
  };

  return (
    <div
      className={`bg-white md:rounded-3xl md:shadow-md overflow-hidden ${
        isAdminRoute
          ? "border-t-4 border-orange-500 lg:border-none rounded-t-3xl"
          : "border-y border-gray-300 md:border-none"
      }`}
    >
      <div className="p-5 lg:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-md lg:text-lg font-medium text-gray-700">
            Spesifikasi Kendaraan
          </h1>
          <div
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs lg:text-sm font-semibold ${
              product.status === "Terjual"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {product.status === "Terjual" ? (
              <XCircle className="w-4 h-4 mr-1.5" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-1.5" />
            )}
            {product.status}
          </div>
        </div>

        <div
          className={`flex flex-col gap-y-5 mb-4 pb-4 ${
            isAdminRoute
              ? "lg:grid lg:grid-cols-4"
              : "lg:flex-row lg:items-center lg:justify-between"
          }`}
        >
          {/* Kilometer */}
          <div className="flex items-center space-x-3">
            <FaRoad className="text-gray-700 w-6 h-6 lg:w-7 lg:h-7 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Kilometer
              </p>
              <span className="text-gray-900 font-medium text-sm lg:text-base">
                {formatNumber(product.travelDistance)} KM
              </span>
            </div>
          </div>

          {/* Transmisi */}
          <div className="flex items-center space-x-3">
            <GiGearStickPattern className="text-gray-700 w-6 h-6 lg:w-7 lg:h-7 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Transmisi
              </p>
              <span className="text-gray-900 font-medium text-sm lg:text-base">
                {product.transmission}
              </span>
            </div>
          </div>

          {/* Bahan Bakar */}
          <div className="flex items-center space-x-3">
            <BsFuelPumpFill className="text-gray-700 w-6 h-6 lg:w-7 lg:h-7 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Bahan Bakar
              </p>
              <span className="text-gray-900 font-medium text-sm lg:text-base">
                {product.fuelType}
              </span>
            </div>
          </div>

          {/* Warna */}
          <div className="flex items-center space-x-3">
            <MdOutlineColorLens className="text-gray-700 w-6 h-6 lg:w-7 lg:h-7 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Warna
              </p>
              <span className="text-gray-900 font-medium text-sm lg:text-base">
                {product.carColor}
              </span>
            </div>
          </div>

          {/* STNK Expiry */}
          <div className="flex items-center space-x-3">
            <FileCheck className="text-gray-700 w-6 h-6 lg:w-7 lg:h-7 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                STNK Berlaku s/d
              </p>
              <span className="text-gray-900 font-medium text-sm lg:text-base">
                {formatDate(product.stnkExpiry)}
              </span>
            </div>
          </div>
        </div>

        <h2 className="text-md lg:text-lg font-medium text-gray-700  mb-5 border-b border-gray-200 pb-2">
          Detail Spesifikasi
        </h2>
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-y-4 ${
            isAdminRoute ? "lg:gap-x-8" : "lg:gap-x-16 "
          }`}
        >
          <div className="space-y-4">
            {/* Merk */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <p className="text-sm text-gray-600">Merk</p>
              <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                {product.brand}
              </span>
            </div>

            {/* Model */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <p className="text-sm text-gray-600">Model</p>
              <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                {product.model}
              </span>
            </div>

            {/* Variant */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <p className="text-sm text-gray-600">Variant</p>
              <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                {product.variant}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <p className="text-sm text-gray-600">Tipe Bodi</p>
              <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                {product.type}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <p className="text-sm text-gray-600">Kapasitas Tempat Duduk</p>
              <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                {product.numberOfSeats} Kursi
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Kapasitas Mesin */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <p className="text-sm text-gray-600">Kapasitas Mesin</p>
              <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                {product.cc} CC
              </span>
            </div>
            {/* Transmisi */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <p className="text-sm text-gray-600">Transmisi</p>
              <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                {product.transmission}
              </span>
            </div>
            {/* Sistem Penggerak */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <p className="text-sm text-gray-600">Sistem Penggerak</p>
              <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                {product.driveSystem}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <p className="text-sm text-gray-600">Plat Nomor</p>
              <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                {product.plateNumber}
              </span>
            </div>

            {/* Tahun Perakitan */}
            <div className="flex justify-between items-center lg:border-b lg:border-gray-100 lg:pb-2">
              <p className="text-sm text-gray-600">Tahun Perakitan</p>
              <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                {product.yearOfAssembly}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarProductModernNoHelper;
