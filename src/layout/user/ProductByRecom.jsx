// layout/user/ProductByRecom.jsx
"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useProducts } from "@/context/ProductContext";
import CarProduct from "@/components/product-user/CarProduct";

const VIEWED_PRODUCTS_KEY = "viewedCarProducts";
const MAX_VIEWED_ITEMS = 10;

const getRecentlyViewed = () => {
  if (typeof window === "undefined") return [];
  const items = localStorage.getItem(VIEWED_PRODUCTS_KEY);
  return items ? JSON.parse(items) : [];
};

const addRecentlyViewed = (product) => {
  if (typeof window === "undefined" || !product) return;
  const viewed = getRecentlyViewed();
  const newItem = {
    id: product._id,
    brand: product.brand,
    model: product.model,
    variant: product.variant,
  };
  const filteredViewed = viewed.filter((item) => item.id !== newItem.id);
  const updatedViewed = [newItem, ...filteredViewed].slice(0, MAX_VIEWED_ITEMS);
  localStorage.setItem(VIEWED_PRODUCTS_KEY, JSON.stringify(updatedViewed));
};

const FILTER_TYPES = {
  RECOMMENDATION: "recommendation",
  LATEST: "latest",
  PRICE_ASC: "price_asc",
  YEAR_DESC: "year_desc",
};

const ProductByRecom = () => {
  const { products, loading, error } = useProducts();
  const [activeFilter, setActiveFilter] = useState(FILTER_TYPES.RECOMMENDATION);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  const displayedProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }
    let sortedProducts = [...products];
    switch (activeFilter) {
      case FILTER_TYPES.LATEST:
        sortedProducts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case FILTER_TYPES.PRICE_ASC:
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case FILTER_TYPES.YEAR_DESC:
        sortedProducts.sort((a, b) => b.yearOfAssembly - a.yearOfAssembly);
        break;
      case FILTER_TYPES.RECOMMENDATION:
        if (recentlyViewed.length === 0) {
          sortedProducts.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        } else {
          const viewedBrands = new Set(
            recentlyViewed.map((item) => item.brand)
          );
          const viewedModels = new Set(
            recentlyViewed.map((item) => `${item.brand}-${item.model}`)
          );
          sortedProducts.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;
            const modelA = `${a.brand}-${a.model}`;
            const modelB = `${b.brand}-${b.model}`;
            if (viewedModels.has(modelA)) scoreA += 2;
            else if (viewedBrands.has(a.brand)) scoreA += 1;
            if (viewedModels.has(modelB)) scoreB += 2;
            else if (viewedBrands.has(b.brand)) scoreB += 1;
            if (scoreB !== scoreA) {
              return scoreB - scoreA;
            } else {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
          });
        }
        break;
      default:
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

  if (error) {
    return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
  }

  const emptyMessage = `Tidak ada produk mobil yang ditemukan ${
    activeFilter !== FILTER_TYPES.LATEST ? `untuk filter ini` : ""
  }.`;

  return (
    <div>
      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveFilter(FILTER_TYPES.RECOMMENDATION)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeFilter === FILTER_TYPES.RECOMMENDATION
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Rekomendasi
        </button>
        <button
          onClick={() => setActiveFilter(FILTER_TYPES.LATEST)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeFilter === FILTER_TYPES.LATEST
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Mobil Terbaru
        </button>
        <button
          onClick={() => setActiveFilter(FILTER_TYPES.PRICE_ASC)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeFilter === FILTER_TYPES.PRICE_ASC
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Harga Terendah
        </button>
        <button
          onClick={() => setActiveFilter(FILTER_TYPES.YEAR_DESC)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeFilter === FILTER_TYPES.YEAR_DESC
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Tahun Terbaru
        </button>
      </div>

      <CarProduct
        products={displayedProducts}
        loading={loading}
        onProductClick={handleProductClick}
        emptyMessage={emptyMessage}
      />
    </div>
  );
};

export default ProductByRecom;
