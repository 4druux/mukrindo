// src/components/admin/dashboard/RecentCarProductsTable.jsx
"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import generateSlug from "@/utils/generateSlug";
import { FaEye } from "react-icons/fa";
import { useProducts } from "@/context/ProductContext";

const RecentCarProductsTable = () => {
  const { products, loading, error } = useProducts();
  const [selectedTab, setSelectedTab] = useState("All");

  if (error) {
    console.error("Error loading products:", error);
    return <div className="p-4 text-red-500">Gagal memuat produk.</div>;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "tersedia":
        return "bg-green-100 text-green-700";
      case "terjual":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const displayedProducts = useMemo(() => {
    if (!products) return [];
    if (selectedTab === "All") return products;
    return products.filter(
      (product) => product.status?.toLowerCase() === selectedTab.toLowerCase()
    );
  }, [products, selectedTab]);

  const renderSkeletonItem = (index) => (
    <div
      key={index}
      className="flex sm:grid sm:grid-cols-12 sm:gap-x-4 py-4 border-b border-gray-200 animate-pulse items-start sm:items-center"
    >
      {/* MODIFIED: Wrapper for Image and Text Placeholder for desktop flex layout */}
      <div className="flex flex-1 items-start sm:col-span-6 sm:flex sm:items-center sm:gap-x-3">
        {/* Image Placeholder */}
        <div className="flex-shrink-0">
          <div className="w-20 h-16 sm:w-20 sm:h-12 bg-gray-300 rounded"></div>
        </div>
        {/* Text Placeholder */}
        <div className="ml-3 sm:ml-0 flex-1 min-w-0">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
          {/* Mobile Price/Status Placeholder */}
          <div className="mt-2 sm:hidden">
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>{" "}
            {/* Price */}
            <div className="h-6 bg-gray-300 rounded-full w-20"></div>{" "}
            {/* Status */}
          </div>
        </div>
      </div>
      {/* Desktop Price Placeholder */}
      <div className="hidden sm:flex sm:col-span-3 sm:items-center">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>
      {/* Desktop Status Placeholder */}
      <div className="hidden sm:flex sm:col-span-2 sm:items-center">
        <div className="h-6 bg-gray-300 rounded-full w-20"></div>
      </div>
    </div>
  );

  return (
    <div className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md bg-white px-4 pb-5 pt-5 sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-2 md:gap-5 mb-2 md:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            {selectedTab === "All" && "Semua Produk Mobil"}
            {selectedTab === "tersedia" && "Produk Mobil Tersedia"}
            {selectedTab === "terjual" && "Produk Mobil Terjual"}
          </h3>
        </div>
        <div className="flex items-start w-full gap-3 sm:w-auto sm:justify-end">
          <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-1 w-full sm:w-auto">
            {["All", "tersedia", "terjual"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-3 py-1.5 font-semibold w-full rounded-md text-xs cursor-pointer transition-colors duration-150 ${
                  selectedTab === tab
                    ? "text-orange-600 bg-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab === "All"
                  ? "Semua"
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="hidden sm:grid sm:grid-cols-12 sm:gap-x-4 py-3 border-b border-gray-200 bg-gray-50 px-2 rounded-t-md">
          <div className="sm:col-span-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Produk
          </div>
          <div className="sm:col-span-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-left">
            Harga
          </div>
          <div className="sm:col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider text-left">
            Status
          </div>
        </div>

        <div>
          {loading ? (
            Array(5)
              .fill(null)
              .map((_, index) => renderSkeletonItem(index))
          ) : displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <Link
                key={product._id}
                href={`/admin/produk/detail-mobil/${generateSlug(
                  product.carName || `${product.brand} ${product.model}`,
                  product._id
                )}`}
                className="flex sm:grid sm:grid-cols-12 sm:gap-x-4 items-start sm:items-center py-4 px-2 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 group"
              >
                <div className="flex flex-1 items-start sm:col-span-6 sm:flex sm:items-center sm:gap-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-16 sm:w-20 sm:h-12 relative">
                      <Image
                        src={product.images?.[0] || "/placeholder-car.png"}
                        alt={
                          product.carName || `${product.brand} ${product.model}`
                        }
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                    </div>
                  </div>

                  {/* Details Column */}
                  <div className="ml-3 sm:ml-0 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {product.brand} {product.model} - {product.variant}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5 text-gray-500 text-xs">
                      <FaEye className="w-3 h-3" />
                      <span>{product.viewCount || 0} views</span>
                    </div>
                    <div className="mt-1 sm:hidden">
                      <p className="text-sm text-orange-600 font-medium mb-1">
                        {formatPrice(product.price)}
                      </p>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusClass(
                          product.status
                        )}`}
                      >
                        {product.status || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price Dekstop View */}
                <div className="hidden sm:flex sm:col-span-3 sm:items-center sm:text-sm sm:text-gray-700 sm:justify-start">
                  {formatPrice(product.price)}
                </div>

                {/* View Dekstop View */}
                <div className="hidden sm:flex sm:col-span-2 sm:items-center sm:justify-start">
                  <span
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusClass(
                      product.status
                    )}`}
                  >
                    {product.status || "N/A"}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              {selectedTab !== "All" && products && products.length > 0
                ? `Tidak ada produk mobil dengan status "${selectedTab}".`
                : "Tidak ada produk mobil yang ditemukan."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default RecentCarProductsTable;
