import React from "react";
// Import Icon
import { BsFuelPumpFill } from "react-icons/bs";
import { GiGearStickPattern } from "react-icons/gi";
import { FaRegCalendarAlt, FaRoad } from "react-icons/fa";
import { MdOutlineColorLens } from "react-icons/md";
import { CheckCircle, FileCheck, XCircle } from "lucide-react";

const CarProduct = ({ product }) => {
  if (!product) {
    return null;
  }

  return (
    <div className="p-4 lg:p-12 rounded-t-3xl border-t border-gray-300 lg:border-none lg:rounded-3xl shadow-lg bg-white">
      <div className="flex flex-col mb-4 lg:mb-8 border-b border-gray-300">
        <div className="flex flex-col items-start space-y-1">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-x-2">
            <h1 className="text-xl text-gray-700">{product.carName}</h1>
            <span className="text-gray-400 hidden lg:block">-</span>
            <p className="text-sm text-gray-500">
              {product.brand} / {product.model}{" "}
              {product.variant ? `/ ${product.variant}` : ""}
            </p>
          </div>
          <p className="text-orange-500 font-semibold text-lg mb-8">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="flex justify-between mb-3">
          <h1 className="text-md mt-1.5 text-gray-700">Spesifikasi Utama</h1>
          {/* Status Ketersediaan */}
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium  ${
              product.status === "Terjual"
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
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
      </div>

      <div className="grid grid-cols-2 gap-x-14 gap-y-6 lg:flex lg:justify-between mb-8 border-b lg:border-none border-gray-300">
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

        <div className="flex items-center space-x-2">
          <BsFuelPumpFill className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
          <div className="flex flex-col">
            <p className="text-xs text-gray-700">Bahan Bakar</p>
            <span className="text-gray-900 font-medium text-sm">
              {product.fuelType}
            </span>
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
              {product.stnkExpiry}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <FaRegCalendarAlt className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
          <div className="flex flex-col">
            <p className="text-xs text-gray-700">Plat Nomor</p>
            <span className="text-gray-900 font-medium text-sm">
              {product.plateNumber}
            </span>
          </div>
        </div>

        <h1 className="block lg:hidden text-md text-gray-700 mb-3">
          Detail Spesifikasi
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-sm">Merk</p>
          <span className="text-gray-900 text-sm font-medium">
            {product.brand}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-sm">Kapasitas Mesin</p>
          <span className="text-gray-900 text-sm font-medium">
            {product.cc} CC
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-sm">Model</p>
          <span className="text-gray-900 text-sm font-medium">
            {product.model}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-sm">Sistem Penggerak</p>
          <span className="text-gray-900 text-sm font-medium">
            {product.driveSystem}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-sm">Variant</p>
          <span className="text-gray-900 text-sm font-medium">
            {product.variant}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-sm">Plat Nomor</p>
          <span className="text-gray-900 text-sm font-medium">
            {product.plateNumber}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-sm">Tipe</p>
          <span className="text-gray-900 text-sm font-medium">
            {product.type}
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
  );
};

export default CarProduct;
