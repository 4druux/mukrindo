// layout/user/product/CarShop.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link"; // Import Link
import { useProducts } from "@/context/ProductContext";
import CarProduct from "@/components/product-user/home/CarProduct";
import AllFilter, { ALL_FILTER_TYPES } from "@/components/global/AllFilter";
import Pagination from "@/components/global/Pagination";
import { FaBoxOpen } from "react-icons/fa";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import levenshtein from "js-levenshtein";

// --- Konstanta ---
const VIEWED_PRODUCTS_KEY = "viewedCarProducts";
const MAX_VIEWED_ITEMS = 10;
const PRICE_LOWER_BOUND = 150000000;
const PRICE_UPPER_BOUND = 300000000;
const PRODUCTS_PER_PAGE = 12;

// --- Helper Functions ---
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

const CarShop = () => {
  const { products, allProducts, loading, error } = useProducts();

  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState(
    ALL_FILTER_TYPES.RECOMMENDATION
  );
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  const searchQueryValue = searchParams.get("search") || "";

  // --- Logika Memproses Produk (Filter & Sortir) ---
  const processedProducts = useMemo(() => {
    // Gunakan allProducts sebagai basis jika tersedia, jika tidak fallback ke products
    const productsToProcess = allProducts || products || [];
    if (loading || !productsToProcess || productsToProcess.length === 0) {
      return [];
    }

    let tempProducts = [...productsToProcess];
    const queryLower = searchQueryValue.toLowerCase();

    // 1. Filter berdasarkan Search Query
    if (searchQueryValue) {
      tempProducts = tempProducts.filter(
        (product) =>
          product.carName.toLowerCase().includes(queryLower) ||
          product.brand.toLowerCase().includes(queryLower) ||
          product.model.toLowerCase().includes(queryLower) ||
          (product.year ?? "").toString().includes(searchQueryValue) || // Case sensitive untuk angka?
          (product.price ?? "").toString().includes(searchQueryValue)
      );
    }

    // 2. Filter berdasarkan Filter Harga Aktif
    switch (activeFilter) {
      case ALL_FILTER_TYPES.PRICE_UNDER_150:
        tempProducts = tempProducts.filter((p) => p.price < PRICE_LOWER_BOUND);
        break;
      case ALL_FILTER_TYPES.PRICE_BETWEEN_150_300:
        tempProducts = tempProducts.filter(
          (p) => p.price >= PRICE_LOWER_BOUND && p.price <= PRICE_UPPER_BOUND
        );
        break;
      case ALL_FILTER_TYPES.PRICE_OVER_300:
        tempProducts = tempProducts.filter((p) => p.price > PRICE_UPPER_BOUND);
        break;
      // Tidak perlu default karena sorting akan menangani kasus lain
    }

    // 3. Sorting berdasarkan Filter Aktif
    let sortedAndFilteredProducts = [...tempProducts];
    switch (activeFilter) {
      case ALL_FILTER_TYPES.LATEST:
        sortedAndFilteredProducts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case ALL_FILTER_TYPES.PRICE_ASC:
        sortedAndFilteredProducts.sort((a, b) => a.price - b.price);
        break;
      case ALL_FILTER_TYPES.YEAR_DESC:
        // Sortir berdasarkan tahun (terbaru dulu), lalu tanggal dibuat (terbaru dulu)
        sortedAndFilteredProducts.sort(
          (a, b) =>
            (b.yearOfAssembly || 0) - (a.yearOfAssembly || 0) ||
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case ALL_FILTER_TYPES.RECOMMENDATION:
        if (recentlyViewed.length === 0) {
          // Jika tidak ada riwayat, urutkan berdasarkan terbaru
          sortedAndFilteredProducts.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        } else {
          // Jika ada riwayat, beri skor berdasarkan kecocokan brand/model
          const viewedBrands = new Set(
            recentlyViewed.map((item) => item.brand?.toLowerCase())
          );
          const viewedModels = new Set(
            recentlyViewed.map(
              (item) =>
                `${item.brand?.toLowerCase()}-${item.model?.toLowerCase()}`
            )
          );
          sortedAndFilteredProducts.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;
            const modelA = `${a.brand?.toLowerCase()}-${a.model?.toLowerCase()}`;
            const modelB = `${b.brand?.toLowerCase()}-${b.model?.toLowerCase()}`;

            if (viewedModels.has(modelA)) scoreA += 2;
            else if (viewedBrands.has(a.brand?.toLowerCase())) scoreA += 1;

            if (viewedModels.has(modelB)) scoreB += 2;
            else if (viewedBrands.has(b.brand?.toLowerCase())) scoreB += 1;

            if (scoreB !== scoreA) return scoreB - scoreA; // Skor tertinggi dulu
            return new Date(b.createdAt) - new Date(a.createdAt); // Jika skor sama, terbaru dulu
          });
        }
        break;
      // Untuk filter harga, default sorting adalah terbaru
      case ALL_FILTER_TYPES.PRICE_UNDER_150:
      case ALL_FILTER_TYPES.PRICE_BETWEEN_150_300:
      case ALL_FILTER_TYPES.PRICE_OVER_300:
      default:
        sortedAndFilteredProducts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
    }

    return sortedAndFilteredProducts;
  }, [
    products,
    allProducts,
    activeFilter,
    recentlyViewed,
    loading,
    error,
    searchParams,
    searchQueryValue,
  ]); // Tambahkan dependencies

  // --- Logika Saran Pencarian (Did you mean?) ---
  const suggestedQuery = useMemo(() => {
    const productsSource = allProducts || products || []; // Sumber data untuk saran
    // Hanya jalankan jika: tidak loading, hasil filter kosong, ada query, dan ada data sumber
    if (
      loading ||
      processedProducts.length > 0 ||
      !searchQueryValue ||
      !productsSource ||
      productsSource.length === 0
    ) {
      return null;
    }

    const queryLower = searchQueryValue.toLowerCase();
    let bestSuggestion = null;
    let minDistance = Infinity;
    // Batas toleransi perbedaan (misal: maks 1/3 panjang query, minimal 1)
    const threshold = Math.max(1, Math.floor(queryLower.length / 3));

    // Kumpulkan target unik (brand, model, carName) dari sumber data
    const targets = new Set();
    productsSource.forEach((p) => {
      if (p.brand) targets.add(p.brand);
      if (p.model) targets.add(p.model);
      if (p.carName) targets.add(p.carName);
      if (p.brand && p.model) targets.add(`${p.brand} ${p.model}`); // Tambahkan ini
    });

    // Bandingkan query dengan setiap target
    targets.forEach((target) => {
      if (!target) return;
      const targetLower = target.toLowerCase();
      if (targetLower === queryLower) return; // Abaikan jika sama persis

      const distance = levenshtein(queryLower, targetLower);

      // Cari yang jaraknya paling kecil dan di bawah threshold
      if (distance < minDistance && distance <= threshold) {
        minDistance = distance;
        bestSuggestion = target; // Simpan target dengan casing asli
      }
    });

    return bestSuggestion;
  }, [loading, processedProducts, searchQueryValue, allProducts, products]); // Tambahkan dependencies

  // --- Logika Breadcrumb Dinamis ---
  const breadcrumbItems = useMemo(() => {
    const items = [
      { label: "Beranda", href: "/" },
      { label: "Beli Mobil", href: "/beli" },
    ];
    const productsSource = allProducts || products || []; // Sumber data untuk brand

    if (searchQueryValue && productsSource.length > 0) {
      const uniqueBrands = [
        ...new Set(
          productsSource.map((p) => p.brand?.toLowerCase()).filter(Boolean)
        ),
      ];
      uniqueBrands.sort((a, b) => b.length - a.length); // Prioritaskan brand panjang

      let foundBrand = null;
      let remainingQuery = searchQueryValue;
      let originalBrandName = null;

      for (const brand of uniqueBrands) {
        if (searchQueryValue.toLowerCase().startsWith(brand)) {
          // Ambil nama brand asli dari produk pertama yang cocok
          originalBrandName =
            productsSource.find((p) => p.brand?.toLowerCase() === brand)
              ?.brand || brand;
          foundBrand = brand; // Simpan versi lowercase untuk pemrosesan
          remainingQuery = searchQueryValue.substring(brand.length).trim();
          break;
        }
      }

      if (originalBrandName) {
        items.push({
          label: originalBrandName,
          href: `/beli?search=${encodeURIComponent(originalBrandName)}`,
        });
        if (remainingQuery) {
          items.push({ label: remainingQuery, href: "" }); // Model/sisa query tidak bisa diklik
          items[items.length - 2].href = `/beli?search=${encodeURIComponent(
            originalBrandName
          )}`; // Brand bisa diklik
        } else {
          items[items.length - 1].href = ""; // Hanya brand, tidak bisa diklik
        }
        items[1].href = "/beli"; // "Beli Mobil" bisa diklik
      } else {
        // Tidak ada brand cocok, tampilkan query utuh
        items.push({ label: `Pencarian: "${searchQueryValue}"`, href: "" });
        items[1].href = "/beli";
      }
    } else if (searchQueryValue) {
      // Ada query tapi tidak ada produk sumber / loading
      items.push({ label: `Pencarian: "${searchQueryValue}"`, href: "" });
      items[1].href = "/beli";
    } else {
      // Tidak ada query
      items[1].href = ""; // "Beli Mobil" tidak bisa diklik
    }

    return items;
  }, [searchQueryValue, products, allProducts]); // Tambahkan dependencies

  // --- Logika Pagination ---
  const indexOfLastProduct = (currentPage + 1) * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const currentProducts = processedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handlePageChange = (data) => {
    setCurrentPage(data.selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [activeFilter, searchParams]);

  const handleProductClick = (product) => {
    addRecentlyViewed(product);
  };

  // --- Tampilan Error ---
  if (error) {
    return (
      <div className="text-red-500 text-center mt-4 p-6">Error: {error}</div>
    );
  }

  // --- Pesan Jika Kosong ---
  const isPriceFilterActive = [
    ALL_FILTER_TYPES.PRICE_UNDER_150,
    ALL_FILTER_TYPES.PRICE_BETWEEN_150_300,
    ALL_FILTER_TYPES.PRICE_OVER_300,
  ].includes(activeFilter);

  let emptyMessage = "Belum ada produk mobil tersedia.";
  if (searchQueryValue) {
    emptyMessage = `Tidak ada produk mobil yang cocok dengan pencarian "${searchQueryValue}".`;
    if (
      activeFilter !== ALL_FILTER_TYPES.RECOMMENDATION ||
      isPriceFilterActive
    ) {
      emptyMessage += ` Coba sesuaikan filter Anda atau periksa ejaan pencarian.`;
    }
  } else if (
    activeFilter !== ALL_FILTER_TYPES.RECOMMENDATION ||
    isPriceFilterActive
  ) {
    emptyMessage = `Tidak ada produk mobil yang cocok dengan filter yang dipilih.`;
  }

  // --- Render Komponen ---
  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar (jika ada) */}
        <div className="lg:w-1/4 hidden lg:block">
          {/* Mungkin ada komponen filter sidebar di sini */}
        </div>

        {/* Konten Utama */}
        <div className="lg:w-3/4 w-full px-4 md:px-0">
          {/* Breadcrumb */}
          <BreadcrumbNav items={breadcrumbItems} />

          {/* Judul Hasil */}
          <h1 className="text-sm lg:text-lg font-medium text-gray-700 mb-2 lg:mb-4">
            {searchQueryValue
              ? `Hasil pencarian untuk "${searchQueryValue}"`
              : "Menampilkan"}
            {!loading && ` ${processedProducts.length} Mobil`}
          </h1>

          {/* Saran Pencarian (Did you mean?) */}
          {!loading &&
            processedProducts.length === 0 &&
            suggestedQuery &&
            searchQueryValue && (
              <p className="mt-1 mb-3 text-sm text-gray-600">
                Mungkin maksud Anda:{" "}
                <Link
                  href={`/beli?search=${encodeURIComponent(suggestedQuery)}`}
                  className="text-orange-600 hover:text-orange-700 hover:underline font-medium"
                  // onClick={() => setCurrentPage(0)} // Reset page jika link diklik
                >
                  {suggestedQuery}
                </Link>
                ?
              </p>
            )}

          {/* Filter Utama */}
          <AllFilter
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />

          {/* Daftar Produk */}
          <CarProduct
            products={currentProducts} // Kirim produk untuk halaman saat ini
            loading={loading}
            onProductClick={handleProductClick}
            emptyMessage={null} // Pesan kosong ditangani di bawah
          />

          {/* Pagination */}
          {!loading &&
            currentProducts.length > 0 &&
            processedProducts.length > PRODUCTS_PER_PAGE && (
              <Pagination
                pageCount={Math.ceil(
                  processedProducts.length / PRODUCTS_PER_PAGE
                )}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            )}

          {/* Tampilan Jika Tidak Ada Produk Sama Sekali */}
          {processedProducts.length === 0 && !loading && (
            <div className="flex justify-center items-center h-[50vh] text-center">
              <div className="flex flex-col sm:flex-row gap-4 items-center text-center sm:text-left">
                <FaBoxOpen className="w-24 h-24 sm:w-36 sm:h-36 text-gray-400" />
                <div className="flex flex-col text-gray-600 mt-4 sm:mt-0">
                  <p className="text-2xl font-semibold">Oops!</p>
                  <p>{emptyMessage}</p>
                  {!loading && suggestedQuery && searchQueryValue && (
                    <p className="mt-2 text-sm">
                      Mungkin maksud Anda:{" "}
                      <Link
                        href={`/beli?search=${encodeURIComponent(
                          suggestedQuery
                        )}`}
                        className="text-orange-600 hover:underline"
                      >
                        {suggestedQuery}
                      </Link>
                      ?
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarShop;
