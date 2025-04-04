// components/product-user/beli-mobil/CarPricingInfo.jsx
import React from "react";
import { RefreshCw, ArrowRight, Calculator } from "lucide-react";

const CarPricingInfo = ({ product }) => {
  if (!product) {
    return null;
  }

  return (
    <div className="p-4 lg:p-8 rounded-3xl border-t border-b border-gray-300 lg:border-none shadow-lg bg-white">
      <h1 className="text-lg font-semibold text-gray-700 mb-4">
        {product.carName} {product.yearOfAssembly}
      </h1>

      <div className="flex items-center text-sm text-gray-600 space-x-2 border-b border-gray-300 pb-4">
        <span> {product.travelDistance.toLocaleString("id-ID")} KM</span>
        <span className="text-gray-300">|</span>
        <span>{product.transmission}</span>
        <span className="text-gray-300">|</span>
        <span>{product.plateNumber}</span>
      </div>

      {/* Harga */}
      <div className="mt-2">
        <p className="text-xl font-semibold text-orange-600">
          Rp {product.price.toLocaleString("id-ID")}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          *Harga berlaku untuk tenor minimal 4 tahun TDP maksimal 20%
        </p>
      </div>

      {/* Estimasi Pembiayaan */}
      <div className="mt-4 p-4 bg-orange-50 rounded-xl">
        <h2 className="text-md text-gray-700 mb-2">Estimasi Pembiayaan</h2>
        <div className="flex justify-between text-sm mb-1 p-3 bg-white rounded-lg">
          <div>
            <p className="text-gray-500">Tenor</p>
            <p className="font-medium text-gray-800">5 Tahun</p>
          </div>
          <div>
            <p className="text-gray-500">TDP</p>
            <p className="font-medium text-gray-800">Rp 24.529.025</p>{" "}
          </div>
          <div>
            <p className="text-gray-500">Cicilan per bulan</p>
            <p className="font-medium text-gray-800">Rp 2.905.125</p>{" "}
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-6">
          *Estimasi dapat berubah sewaktu-waktu
        </p>
        <button
          className="flex items-center justify-center gap-2 py-3 bg-orange-600 text-white rounded-full
         hover:bg-orange-700 transition duration-200 cursor-pointer w-full mb-1"
        >
          <Calculator className="w-5 h-5" />
          <span className="text-sm">Hitung Ulang</span>
        </button>
        <p className="text-xs text-center text-gray-500 mb-6">
          *Hitung ulang sesuai dengan kemampuan anda
        </p>
      </div>

      {/* Tombol Aksi */}
      <div className="mt-4 flex flex-col lg:flex-row gap-3 w-full">
        <button
          className="flex items-center justify-center gap-2 p-4 border border-orange-600 text-orange-600 
        rounded-full hover:bg-orange-50 transition duration-200 cursor-pointer lg:w-1/2"
        >
          <RefreshCw className="w-5 h-5" />
          <span className="text-sm">Tukar Tambah</span>
        </button>
        <button
          className="flex items-center justify-center gap-2 p-4 bg-orange-600 text-white rounded-full
         hover:bg-orange-700 transition duration-200 cursor-pointer lg:w-1/2"
        >
          <span className="text-sm">Cek Sekarang</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CarPricingInfo;
