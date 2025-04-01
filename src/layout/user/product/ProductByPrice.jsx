// layout/user/product/ProductByPrice.jsx
"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useProducts } from "@/context/ProductContext";
import CarProduct from "@/components/product-user/CarProduct";
import Link from "next/link";

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

const PRICE_FILTER_TYPES = {
  ALL: "all",
  UNDER_150: "under_150",
  BETWEEN_150_300: "between_150_300",
  OVER_300: "over_300",
};

// Batas Harga (dalam angka)
const PRICE_LOWER_BOUND = 150000000;
const PRICE_UPPER_BOUND = 300000000;

const ProductByPrice = () => {
  const { products, loading, error } = useProducts();
  const [activePriceFilter, setActivePriceFilter] = useState(
    PRICE_FILTER_TYPES.ALL
  );
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  const displayedProducts = useMemo(() => {
    if (loading || !products || products.length === 0) {
      return [];
    }

    let filteredProducts = products;

    switch (activePriceFilter) {
      case PRICE_FILTER_TYPES.UNDER_150:
        filteredProducts = products.filter((p) => p.price < PRICE_LOWER_BOUND);
        break;
      case PRICE_FILTER_TYPES.BETWEEN_150_300:
        filteredProducts = products.filter(
          (p) => p.price >= PRICE_LOWER_BOUND && p.price <= PRICE_UPPER_BOUND
        );
        break;
      case PRICE_FILTER_TYPES.OVER_300:
        filteredProducts = products.filter((p) => p.price > PRICE_UPPER_BOUND);
        break;
      case PRICE_FILTER_TYPES.ALL:
      default:
        filteredProducts = products;
        break;
    }

    return filteredProducts;
  }, [products, activePriceFilter, loading]);

  const handleProductClick = (product) => {
    addRecentlyViewed(product);
  };

  if (error) {
    return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
  }

  const emptyMessage = `Tidak ada produk mobil yang ditemukan ${
    activePriceFilter !== PRICE_FILTER_TYPES.ALL
      ? `untuk rentang harga ini`
      : ""
  }.`;

  return (
    <div className="py-8">
      <h1 className="text-xl font-medium text-gray-700 mb-4">
        Mobil Pilihan Sesuai Budget
      </h1>

      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setActivePriceFilter(PRICE_FILTER_TYPES.ALL)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activePriceFilter === PRICE_FILTER_TYPES.ALL
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Semua Harga
        </button>
        <button
          onClick={() => setActivePriceFilter(PRICE_FILTER_TYPES.UNDER_150)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activePriceFilter === PRICE_FILTER_TYPES.UNDER_150
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Dibawah 150 Juta
        </button>
        <button
          onClick={() =>
            setActivePriceFilter(PRICE_FILTER_TYPES.BETWEEN_150_300)
          }
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activePriceFilter === PRICE_FILTER_TYPES.BETWEEN_150_300
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          150 - 300 Juta
        </button>
        <button
          onClick={() => setActivePriceFilter(PRICE_FILTER_TYPES.OVER_300)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activePriceFilter === PRICE_FILTER_TYPES.OVER_300
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Diatas 300 Juta
        </button>
      </div>

      <CarProduct
        products={displayedProducts.slice(0, 9)}
        loading={loading}
        onProductClick={handleProductClick}
        emptyMessage={emptyMessage}
      />

      <div className="flex flex-col items-end mt-4">
        <p className="text-sm text-gray-500">
          Hanya menampilkan {displayedProducts.slice(0, 9).length} dari{" "}
          {products.length} Mobil
        </p>
        <Link href="/beli">
          <p className="text-sm text-orange-500 font-medium hover:text-orange-600 hover:text-underline hover:underline cursor-pointer">
            Tampilkan Semua Mobil
          </p>
        </Link>
      </div>
    </div>
  );
};

export default ProductByPrice;
