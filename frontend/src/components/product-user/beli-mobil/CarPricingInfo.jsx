// components/product-user/beli-mobil/CarPricingInfo.jsx
import React, { useState } from "react";

import { useProducts } from "@/context/ProductContext";
import { RefreshCw, ArrowRight, Calculator, Heart } from "lucide-react";

const CarPricingInfo = ({ product }) => {
  if (!product) {
    return null;
  }

  const { isBookmarked, toggleBookmark } = useProducts();
  const liked = isBookmarked(product._id);

  return (
    <div className="p-4 lg:p-8 rounded-t-3xl lg:rounded-3xl border-t border-b border-gray-300 lg:border-none lg:shadow-md bg-white">
      <div className="flex justify-between w-full gap-10 mb-4">
        <h1 className="text-lg font-semibold text-gray-700">
          {product.carName} {product.yearOfAssembly}
        </h1>

        <div
          className="block lg:hidden"
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmark(product._id);
          }}
        >
          <Heart
            className={`w-6 h-6 mt-1 ${
              liked ? "text-red-500 fill-red-500" : "text-gray-700 fill-none"
            }`}
          />
        </div>
      </div>

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
          *Harga diatas merupakan harga cash untuk perhitungan kredit hubungi
          kami
        </p>
      </div>

    
      <div className="mt-4 flex flex-col gap-3 w-full">
        <button
          className="flex items-center justify-center gap-2 py-3.5 border border-orange-600 text-orange-600 
        rounded-full hover:bg-orange-50 transition duration-200 cursor-pointer"
        >
          <RefreshCw className="w-5 h-5" />
          <span className="text-sm">Tukar Tambah</span>
        </button>
        <button
          className="flex items-center justify-center gap-2 py-4 bg-orange-600 text-white rounded-full
         hover:bg-orange-500 transition duration-200 cursor-pointer"
        >
          <span className="text-sm">Cek Sekarang</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CarPricingInfo;
