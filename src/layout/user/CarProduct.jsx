// pages/cars.jsx atau di mana pun CarProduct digunakan
"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import SkeletonAllProduct from "@/components/skeleton/SkeletonAllProduct";
import { useProducts } from "@/context/ProductContext";
import generateSlug from "@/utils/generateSlug";
import { BsFuelPumpFill } from "react-icons/bs";
import { FaRegCalendarAlt, FaRoad } from "react-icons/fa";
import { GiGearStickPattern } from "react-icons/gi";
import { MdOutlineColorLens } from "react-icons/md";
import ProductImageSlider from "@/components/product-user/ProductImageSlider";

// Helper untuk localStorage (Rekomendasi)
const VIEWED_PRODUCTS_KEY = "viewedCarProducts";
const MAX_VIEWED_ITEMS = 10; // Batasi jumlah item dalam riwayat

const getRecentlyViewed = () => {
  if (typeof window === "undefined") return [];
  const items = localStorage.getItem(VIEWED_PRODUCTS_KEY);
  return items ? JSON.parse(items) : [];
};

const addRecentlyViewed = (product) => {
  if (typeof window === "undefined" || !product) return;
  const viewed = getRecentlyViewed();
  // Simpan info relevan untuk rekomendasi
  const newItem = {
    id: product._id,
    brand: product.brand, // Asumsi field ini ada
    model: product.model, // Asumsi field ini ada
    variant: product.variant, // Asumsi field ini ada
  };
  // Hapus jika sudah ada (untuk dipindahkan ke depan)
  const filteredViewed = viewed.filter((item) => item.id !== newItem.id);
  // Tambahkan ke depan dan batasi jumlahnya
  const updatedViewed = [newItem, ...filteredViewed].slice(0, MAX_VIEWED_ITEMS);
  localStorage.setItem(VIEWED_PRODUCTS_KEY, JSON.stringify(updatedViewed));
};

// Tipe Filter
const FILTER_TYPES = {
  RECOMMENDATION: "recommendation",
  LATEST: "latest",
  PRICE_ASC: "price_asc",
  YEAR_DESC: "year_desc",
};

const CarProduct = () => {
  const { products, loading, error } = useProducts();
  const [activeFilter, setActiveFilter] = useState(FILTER_TYPES.RECOMMENDATION);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Ambil data viewed items saat komponen mount di client-side
  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  // Memo untuk produk yang akan ditampilkan setelah filter/sort
  const displayedProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }

    // Buat salinan agar tidak mengubah state asli dari context
    let sortedProducts = [...products];

    switch (activeFilter) {
      case FILTER_TYPES.LATEST:
        // Asumsi 'createdAt' ada dan bisa di-parse sebagai Date
        // Urutkan dari yang terbaru (descending)
        sortedProducts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case FILTER_TYPES.PRICE_ASC:
        // Urutkan dari harga terendah (ascending)
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case FILTER_TYPES.YEAR_DESC:
        // Asumsi 'yearOfAssembly' ada (number)
        // Urutkan dari tahun terbaru (descending)
        sortedProducts.sort((a, b) => b.yearOfAssembly - a.yearOfAssembly);
        break;
      case FILTER_TYPES.RECOMMENDATION:
        if (recentlyViewed.length === 0) {
          // Jika tidak ada riwayat, tampilkan yang terbaru saja sebagai fallback
          sortedProducts.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        } else {
          // Logika Rekomendasi Sederhana (Client-Side)
          // Beri skor berdasarkan kesamaan dengan item yang dilihat
          const viewedBrands = new Set(
            recentlyViewed.map((item) => item.brand)
          );
          const viewedModels = new Set(
            recentlyViewed.map((item) => `${item.brand}-${item.model}`)
          );
          // const viewedVariants = new Set(recentlyViewed.map(item => `${item.brand}-${item.model}-${item.variant}`)); // Mungkin terlalu spesifik

          sortedProducts.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;

            const modelA = `${a.brand}-${a.model}`;
            const modelB = `${b.brand}-${b.model}`;

            if (viewedModels.has(modelA)) scoreA += 2;
            else if (viewedBrands.has(a.brand)) scoreA += 1;

            if (viewedModels.has(modelB)) scoreB += 2;
            else if (viewedBrands.has(b.brand)) scoreB += 1;

            // Prioritaskan skor, lalu yang terbaru jika skor sama
            if (scoreB !== scoreA) {
              return scoreB - scoreA; // Skor tertinggi dulu
            } else {
              return new Date(b.createdAt) - new Date(a.createdAt); // Terbaru dulu
            }
          });
        }
        break;
      default:
        // Default sort (misalnya terbaru)
        sortedProducts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }

    return sortedProducts;
  }, [products, activeFilter, recentlyViewed]);

  const handleProductClick = (product) => {
    addRecentlyViewed(product);
    if (activeFilter === FILTER_TYPES.RECOMMENDATION) {
      setRecentlyViewed(getRecentlyViewed());
    }
  };

  const skeletonCount = 6;

  if (error) {
    return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
  }

  return (
    <div>
      {/* Filter Buttons */}
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveFilter(FILTER_TYPES.RECOMMENDATION)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            activeFilter === FILTER_TYPES.RECOMMENDATION
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Rekomendasi
        </button>
        <button
          onClick={() => setActiveFilter(FILTER_TYPES.LATEST)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            activeFilter === FILTER_TYPES.LATEST
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Mobil Terbaru
        </button>
        <button
          onClick={() => setActiveFilter(FILTER_TYPES.PRICE_ASC)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            activeFilter === FILTER_TYPES.PRICE_ASC
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Harga Terendah
        </button>
        <button
          onClick={() => setActiveFilter(FILTER_TYPES.YEAR_DESC)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            activeFilter === FILTER_TYPES.YEAR_DESC
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Tahun Terbaru
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {loading
          ? Array(skeletonCount)
              .fill(null)
              .map((_, index) => <SkeletonAllProduct key={index} />)
          : displayedProducts.map((product) => (
              <div
                key={product._id}
                className="rounded-2xl bg-white overflow-hidden transition-shadow duration-200 relative shadow-md hover:shadow-xl"
                onClick={() => handleProductClick(product)}
              >
                <Link
                  href={`/car-details/${generateSlug(
                    product.carName,
                    product._id
                  )}`}
                  // onClick={(e) => e.stopPropagation()} // Opsional: jika onClick di div induk tidak diinginkan saat link diklik
                >
                  <div>
                    <ProductImageSlider
                      images={product.images}
                      altText={product.carName}
                      status={product.status}
                      brand={product.brand}
                      model={product.model}
                      variant={product.variant}
                    />

                    <div className="p-6">
                      <div className="flex flex-col border-b border-gray-300 pb-2">
                        <h2
                          className="text-md text-gray-800 truncate"
                          title={product.carName}
                        >
                          {product.carName}
                        </h2>
                        <p className="text-orange-500 font-medium text-lg mt-2">
                          Rp {product.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="flex justify-between py-3 mt-2">
                        {/* Detail Spesifikasi Mobil */}
                        <div className="flex flex-col items-center space-y-1 text-center">
                          <FaRoad className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-600 text-xs">
                            {product.travelDistance.toLocaleString("id-ID")} KM
                          </span>
                        </div>
                        <div className="flex flex-col items-center space-y-1 text-center">
                          <GiGearStickPattern className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-600 text-xs">
                            {product.transmission}
                          </span>
                        </div>
                        <div className="flex flex-col items-center space-y-1 text-center">
                          <BsFuelPumpFill className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-600 text-xs">
                            {product.fuelType}
                          </span>
                        </div>
                        <div className="flex flex-col items-center space-y-1 text-center">
                          <FaRegCalendarAlt className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-600 text-xs">
                            {product.plateNumber}
                          </span>
                        </div>
                        <div className="flex flex-col items-center space-y-1 text-center">
                          <MdOutlineColorLens className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-600 text-xs">
                            {product.carColor}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}

        {!loading && displayedProducts.length === 0 && (
          <div className="col-span-full text-center text-gray-500 mt-4">
            Tidak ada produk mobil yang ditemukan{" "}
            {activeFilter !== FILTER_TYPES.LATEST ? `untuk filter ini` : ""}.
          </div>
        )}
      </div>
    </div>
  );
};

export default CarProduct;
