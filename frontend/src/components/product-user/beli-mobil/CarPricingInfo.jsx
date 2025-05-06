// components/product-user/beli-mobil/CarPricingInfo.jsx
import React, { useState } from "react";

import { useRouter } from "next/navigation";
import { useProducts } from "@/context/ProductContext";
import { RefreshCw, ArrowRight, Heart } from "lucide-react";

const CarPricingInfo = ({ product }) => {
  if (!product) {
    return null;
  }

  const { isBookmarked, toggleBookmark } = useProducts();
  const router = useRouter();
  const liked = isBookmarked(product._id);

  const handleTradeInClick = () => {
    if (product) {
      const queryParams = new URLSearchParams({
        newBrand: product.brand || "",
        newModel: product.model || "",
        newVariant: product.variant || "",
        newTransmission: product.transmission || "",
        newCarColor: product.carColor || "",
      });
      router.push(`/tukar-tambah?${queryParams.toString()}`);
    }
  };

  return (
    <div className="p-4 md:p-8 rounded-t-3xl md:rounded-3xl border-t-4 border-t-orange-500 border-b border-gray-300 md:border-none md:shadow-md bg-white">
      <div className="flex justify-between w-full gap-10 mb-4">
        <h1 className="text-lg font-semibold text-gray-700">
          {product.carName}
        </h1>

        <div
          className="block md:hidden"
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

      <div className="mt-4 flex flex-col lg:flex-row gap-3 w-full">
        <button
          onClick={handleTradeInClick}
          className="flex items-center justify-center gap-2 py-3.5 border border-orange-600 text-orange-600 
          rounded-full hover:bg-orange-50 transition duration-200 cursor-pointer w-full"
        >
          <RefreshCw className="w-5 h-5" />
          <span className="text-sm">Tukar Tambah</span>
        </button>
        <button
          className="flex items-center justify-center gap-2 py-4 text-white rounded-full
         bg-orange-500 hover:bg-orange-600 transition duration-300 ease-in-out cursor-pointer w-full"
        >
          <span className="text-sm">Cek Sekarang</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CarPricingInfo;
