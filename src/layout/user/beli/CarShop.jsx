// layout/user/product/CarShop.jsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProducts } from "@/context/ProductContext";

// Import Components
import AllFilter, { ALL_FILTER_TYPES } from "@/components/global/AllFilter";
import Pagination from "@/components/global/Pagination";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import { useFilterAndSuggest } from "@/hooks/useFilterAndSuggest";
import CarProductCard from "@/components/global/CarProductCard";
import ActiveSearchFilters from "@/components/global/ActiveSearchFilter";
import EmptyProductDisplay from "@/components/global/EmptyProductDisplay";

const VIEWED_PRODUCTS_KEY = "viewedCarProducts";
const MAX_VIEWED_ITEMS = 10;
const PRODUCTS_PER_PAGE = 12;

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
  const router = useRouter();
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  const searchQuery = searchParams.get("search") || "";

  const { processedProducts, suggestedQuery, activeFilter, setActiveFilter } =
    useFilterAndSuggest({
      initialProducts: allProducts || products || [],
      searchQuery: searchQuery,
      initialFilter: ALL_FILTER_TYPES.RECOMMENDATION,
      options: {
        recentlyViewed: recentlyViewed,
        searchFields: [
          "carName",
          "brand",
          "model",
          "year",
          "price",
          "plateNumber",
          "variant",
          "transmission",
          "fuelType",
        ],
        suggestionTargets: ["brand", "model", "carName"],
      },
      isLoading: loading,
    });

  const splitSearchFilter = useMemo(() => {
    const result = {
      brand: null,
      modelQuery: null,
      fullQuery: searchQuery,
    };
    if (!searchQuery) return result;

    const productsSource = allProducts || products || [];
    if (productsSource.length === 0) return result; // Tidak bisa split tanpa data produk

    const uniqueBrands = [
      ...new Set(
        productsSource.map((p) => p.brand?.toLowerCase()).filter(Boolean)
      ),
    ];
    uniqueBrands.sort((a, b) => b.length - a.length); // Prioritaskan nama brand lebih panjang

    let foundBrand = null;
    let remainingQuery = searchQuery;
    let originalBrandName = null;

    for (const brand of uniqueBrands) {
      // Cek apakah query dimulai dengan brand + spasi atau sama persis
      if (
        searchQuery.toLowerCase().startsWith(brand + " ") ||
        searchQuery.toLowerCase() === brand
      ) {
        originalBrandName =
          productsSource.find((p) => p.brand?.toLowerCase() === brand)?.brand ||
          brand.charAt(0).toUpperCase() + brand.slice(1); // Ambil nama asli atau capitalize
        foundBrand = brand;
        // Ambil sisa query hanya jika ada spasi setelah brand
        if (searchQuery.toLowerCase().startsWith(brand + " ")) {
          remainingQuery = searchQuery.substring(brand.length).trim();
        } else {
          remainingQuery = ""; // Jika hanya brand, tidak ada sisa query
        }
        break;
      }
    }

    if (originalBrandName) {
      result.brand = originalBrandName;
      result.modelQuery = remainingQuery || null; // Set null jika kosong
    } else {
      // Jika tidak ada brand yang cocok di awal, anggap seluruh query adalah 'model'
      result.modelQuery = searchQuery;
    }

    return result;
  }, [searchQuery, products, allProducts]);

  const breadcrumbItems = useMemo(() => {
    const items = [
      { label: "Beranda", href: "/" },
      { label: "Beli Mobil", href: "/beli" },
    ];

    if (splitSearchFilter.brand) {
      items.push({
        label: splitSearchFilter.brand,
        href: `/beli?search=${encodeURIComponent(splitSearchFilter.brand)}`,
      });
      if (splitSearchFilter.modelQuery) {
        items.push({ label: splitSearchFilter.modelQuery, href: "" });
        // Pastikan link brand benar
        items[items.length - 2].href = `/beli?search=${encodeURIComponent(
          splitSearchFilter.brand
        )}`;
      } else {
        // Jika hanya brand, link brand tidak aktif di breadcrumb terakhir
        items[items.length - 1].href = "";
      }
      items[1].href = "/beli"; // Pastikan link "Beli Mobil" aktif
    } else if (searchQuery) {
      // Jika ada query tapi tidak ada brand terdeteksi
      items.push({ label: `Pencarian: "${searchQuery}"`, href: "" });
      items[1].href = "/beli";
    } else {
      // Halaman Beli Mobil tanpa search
      items[1].href = "";
    }

    return items;
  }, [searchQuery, splitSearchFilter]);

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
  if (searchQuery) {
    emptyMessage = `Tidak ada produk mobil yang cocok dengan pencarian "${searchQuery}".`;
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

  const handleClearSearch = () => {
    router.push("/beli");
  };

  const handleRemoveBrandFilter = () => {
    if (splitSearchFilter.modelQuery) {
      router.push(
        `/beli?search=${encodeURIComponent(splitSearchFilter.modelQuery)}`
      );
    } else {
      handleClearSearch();
    }
  };

  const handleRemoveModelFilter = () => {
    if (splitSearchFilter.brand) {
      router.push(
        `/beli?search=${encodeURIComponent(splitSearchFilter.brand)}`
      );
    } else {
      handleClearSearch();
    }
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/4 hidden lg:block"></div>

        <div className="lg:w-3/4 w-full">
          <BreadcrumbNav items={breadcrumbItems} />
          <h1 className="text-sm lg:text-lg font-medium text-gray-700 mb-4">
            {searchQuery
              ? `Hasil pencarian untuk "${searchQuery}"`
              : "Menampilkan"}
            {!loading && ` ${processedProducts.length} Mobil`}
          </h1>
          {!loading && searchQuery && (
            <ActiveSearchFilters
              splitResult={splitSearchFilter}
              onClearSearch={handleClearSearch}
              onRemoveBrand={handleRemoveBrandFilter}
              onRemoveModel={handleRemoveModelFilter}
            />
          )}
          {/* Saran Pencarian */}
          {!loading &&
            processedProducts.length === 0 &&
            suggestedQuery &&
            searchQuery && (
              <p className="mt-1 mb-3 text-sm text-gray-600">
                Mungkin maksud Anda{" "}
                <Link
                  href={`/beli?search=${encodeURIComponent(suggestedQuery)}`}
                  className="text-orange-500 hover:underline font-medium"
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
          <CarProductCard
            products={currentProducts}
            loading={loading}
            error={error}
            onProductClick={handleProductClick}
            emptyMessage={null}
            isCarShopRoute={true}
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
          {/* Produk Kosong */}
          {processedProducts.length === 0 && !loading && (
            <EmptyProductDisplay
              emptyMessage={emptyMessage}
              suggestedQuery={suggestedQuery}
              searchQuery={searchQuery}
              suggestionLinkHref={
                suggestedQuery
                  ? `/beli?search=${encodeURIComponent(suggestedQuery)}`
                  : null
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CarShop;
