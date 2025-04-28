// src/components/global/CarProduct.jsx
import React from "react";

// Import Icon
import { BsFuelPumpFill } from "react-icons/bs";
import { GiGearStickPattern } from "react-icons/gi";
import { FaRegCalendarAlt, FaRoad } from "react-icons/fa";
import { MdOutlineColorLens } from "react-icons/md";
import { CheckCircle, FileCheck, XCircle } from "lucide-react";

const CarProduct = ({ product, isAdminRoute = false }) => {
  if (!product) {
    return null;
  }

  return (
    <div
      className={`p-4 lg:p-8 lg:rounded-3xl lg:border-none lg:shadow-md bg-white ${
        isAdminRoute
          ? "rounded-t-3xl border-t border-gray-300"
          : "border-t border-b border-gray-200"
      }
    `}
    >
      {/* Header Spesifikasi Utama & Status */}
      <div className="flex flex-col mb-4 lg:mb-8 border-b border-gray-300">
        <div className="flex justify-between mb-3">
          <h1 className="text-md mt-1 text-gray-700">Spesifikasi Utama</h1>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs lg:text-sm font-medium  ${
              product.status === "Terjual"
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {product.status === "Terjual" ? (
              <XCircle className="w-4 h-4 mr-1 lg:mr-1.5" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-1 lg:mr-1.5" />
            )}
            {product.status}
          </div>
        </div>
      </div>

      {/* Grid Spesifikasi Utama */}
      <div className="grid grid-cols-2 gap-x-14 gap-y-6 lg:flex lg:justify-between lg:gap-x-4 mb-4 lg:mb-8 border-b lg:border-none border-gray-300">
        <div className="flex items-center space-x-2">
          <FaRoad className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
          <div className="flex flex-col">
            <p className="text-xs text-gray-700">Kilometer</p>
            <span className="text-gray-900 font-medium text-sm">
              {product.travelDistance.toLocaleString("id-ID")} KM
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <GiGearStickPattern className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
          <div className="flex flex-col">
            <p className="text-xs text-gray-700">Transmisi</p>
            <span className="text-gray-900 font-medium text-sm">
              {product.transmission}
            </span>
          </div>
        </div>

        <div className="block lg:hidden">
          <div className="flex items-center space-x-2">
            <BsFuelPumpFill className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
            <div className="flex flex-col">
              <p className="text-xs text-gray-700">Bahan Bakar</p>
              <span className="text-gray-900 font-medium text-sm">
                {product.fuelType}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <MdOutlineColorLens className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
          <div className="flex flex-col">
            <p className="text-xs text-gray-700">Warna</p>
            <span className="text-gray-900 font-medium text-sm">
              {product.carColor}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <FileCheck className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
          <div className="flex flex-col">
            <p className="text-xs text-gray-700">Masa Berlaku STNK</p>
            <span className="text-gray-900 font-medium text-sm">
              {new Date(product.stnkExpiry).toLocaleDateString("id-ID", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="block lg:hidden">
          <div className="flex items-center space-x-2">
            <FaRegCalendarAlt className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
            <div className="flex flex-col">
              <p className="text-xs text-gray-700">Plat Nomor</p>
              <span className="text-gray-900 font-medium text-sm">
                {product.plateNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Judul Detail Spesifikasi hanya tampil di mobile */}
        <h1 className="block lg:hidden text-md text-gray-700 mb-3">
          Detail Spesifikasi
        </h1>
      </div>

      {/* Detail Spesifikasi Lanjutan (Kolom) */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 lg:gap-14">
        {/* Kolom Kiri */}
        <div className="flex flex-col flex-2 gap-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">Merk</p>
            <span className="text-gray-900 text-sm font-medium">
              {product.brand}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">Model</p>
            <span className="text-gray-900 text-sm font-medium">
              {product.model}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">Variant</p>
            <span className="text-gray-900 text-sm font-medium">
              {product.variant}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">Kapasitas Mesin</p>
            <span className="text-gray-900 text-sm font-medium">
              {product.cc} CC
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">Transmisi</p>
            <span className="text-gray-900 text-sm font-medium">
              {product.transmission}
            </span>
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="flex flex-col flex-2 gap-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">Sistem Penggerak</p>
            <span className="text-gray-900 text-sm font-medium">
              {product.driveSystem}
            </span>
          </div>

          <div className="hidden lg:flex items-center justify-between">
            <p className="text-gray-600 text-sm">Bahan Bakar</p>
            <span className="text-gray-900 text-sm font-medium">
              {product.fuelType}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">Tipe</p>
            <span className="text-gray-900 text-sm font-medium">
              {product.type}
            </span>
          </div>

          <div className="hidden lg:flex items-center justify-between">
            <p className="text-gray-600 text-sm">Plat Nomor</p>
            <span className="text-gray-900 text-sm font-medium">
              {product.plateNumber}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">Tahun Perakitan</p>
            <span className="text-gray-900 text-sm font-medium">
              {product.yearOfAssembly}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarProduct;
