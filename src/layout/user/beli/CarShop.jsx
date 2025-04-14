// layout/user/product/CarShop.jsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProducts } from "@/context/ProductContext";
import { Filter, X } from "lucide-react";

// Import Components
import ShortProduct, { SHORT_BY } from "@/components/global/ShortProduct";
import Pagination from "@/components/global/Pagination";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import { useFilterAndSuggest } from "@/hooks/useFilterAndSuggest";
import CarProductCard from "@/components/global/CarProductCard";
import ActiveSearchFilters from "@/components/global/ActiveSearchFilter";
import EmptyProductDisplay from "@/components/global/EmptyProductDisplay";
import SearchFilters from "@/components/product-user/beli/SearchFilters";
import { AnimatePresence, motion } from "framer-motion";

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
  const [isMobileSearchFiltersOpen, setIsMobileSearchFiltersOpen] =
    useState(false);

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  const searchQuery = searchParams.get("search") || "";

  const { processedProducts, suggestedQuery, activeFilter, setActiveFilter } =
    useFilterAndSuggest({
      initialProducts:
        allProducts && allProducts.length > 0 ? allProducts : products || [],
      searchQuery: searchQuery,
      initialFilter: SHORT_BY.RECOMMENDATION,
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
          "type",
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

    const productsSource =
      allProducts && allProducts.length > 0 ? allProducts : products || [];
    if (productsSource.length === 0) return result;

    const uniqueBrands = [
      ...new Set(
        productsSource.map((p) => p.brand?.toLowerCase()).filter(Boolean)
      ),
    ];
    uniqueBrands.sort((a, b) => b.length - a.length);

    let foundBrand = null;
    let remainingQuery = searchQuery;
    let originalBrandName = null;

    for (const brand of uniqueBrands) {
      if (
        searchQuery.toLowerCase().startsWith(brand + " ") ||
        searchQuery.toLowerCase() === brand
      ) {
        originalBrandName =
          productsSource.find((p) => p.brand?.toLowerCase() === brand)?.brand ||
          brand.charAt(0).toUpperCase() + brand.slice(1);
        foundBrand = brand;
        if (searchQuery.toLowerCase().startsWith(brand + " ")) {
          remainingQuery = searchQuery.substring(brand.length).trim();
        } else {
          remainingQuery = "";
        }
        break;
      }
    }

    if (originalBrandName) {
      result.brand = originalBrandName;
      result.modelQuery = remainingQuery || null;
    } else {
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
        items[items.length - 2].href = `/beli?search=${encodeURIComponent(
          splitSearchFilter.brand
        )}`;
      } else {
        items[items.length - 1].href = "";
      }
      items[1].href = "/beli";
    } else if (searchQuery) {
      items.push({ label: `Pencarian: "${searchQuery}"`, href: "" });
      items[1].href = "/beli";
    } else {
      items[1].href = "";
    }

    const urlParams = new URLSearchParams(searchParams);
    const activeUrlFilters = [];
    if (urlParams.get("brand"))
      activeUrlFilters.push(`${urlParams.get("brand")}`);
    if (urlParams.get("model"))
      activeUrlFilters.push(`${urlParams.get("model")}`);

    if (
      activeUrlFilters.length > 0 &&
      !splitSearchFilter.brand &&
      !searchQuery
    ) {
      items.push({ label: `${activeUrlFilters.join(", ")}`, href: "" });
      items[1].href = "/beli";
    }

    return items;
  }, [searchQuery, splitSearchFilter, searchParams]);

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
  const isAnyFilterActive = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    const hasUrlFilter = [
      "brand",
      "model",
      "type",
      "transmission",
      "fuelType",
      "yearMin",
      "yearMax",
      "priceMin",
      "priceMax",
    ].some((key) => params.has(key));

    const isShortProductFilterActive = activeFilter !== SHORT_BY.RECOMMENDATION;
    return hasUrlFilter || isShortProductFilterActive;
  }, [searchParams, activeFilter]);

  let emptyMessage = "Belum ada produk mobil tersedia.";
  if (searchQuery) {
    emptyMessage = `Tidak ada produk mobil yang cocok dengan pencarian "${searchQuery}".`;
    if (isAnyFilterActive) {
      emptyMessage += ` Coba sesuaikan filter Anda atau periksa ejaan pencarian.`;
    }
  } else if (isAnyFilterActive) {
    emptyMessage = `Tidak ada produk mobil yang cocok dengan filter yang dipilih.`;
  }

  const handleClearAllFilters = () => {
    router.push("/beli");
  };

  const handleRemoveSearchPart = (partToRemove) => {
    const currentParams = new URLSearchParams(searchParams);
    let newSearchQuery = "";

    if (partToRemove === "brand" && splitSearchFilter.modelQuery) {
      newSearchQuery = splitSearchFilter.modelQuery;
    } else if (partToRemove === "model" && splitSearchFilter.brand) {
      newSearchQuery = splitSearchFilter.brand;
    }

    if (newSearchQuery) {
      currentParams.set("search", newSearchQuery);
    } else {
      currentParams.delete("search");
    }

    const queryString = currentParams.toString();
    router.push(`/beli${queryString ? `?${queryString}` : ""}`);
  };

  const handleRemoveFilterParam = (paramNameToRemove) => {
    const currentParams = new URLSearchParams(searchParams);

    if (paramNameToRemove === "priceMin" || paramNameToRemove === "priceMax") {
      currentParams.delete("priceMin");
      currentParams.delete("priceMax");
    } else if (
      paramNameToRemove === "yearMin" ||
      paramNameToRemove === "yearMax"
    ) {
      currentParams.delete("yearMin");
      currentParams.delete("yearMax");
    } else {
      currentParams.delete(paramNameToRemove);
    }

    const queryString = currentParams.toString();
    router.push(`/beli${queryString ? `?${queryString}` : ""}`);
  };

  useEffect(() => {
    document.body.style.overflow = isMobileSearchFiltersOpen
      ? "hidden"
      : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileSearchFiltersOpen]);

  const mobileFilterPanelVariants = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: { type: "tween", duration: 0.4, ease: "easeInOut" },
    },
    exit: {
      x: "100%",
      transition: { type: "tween", duration: 0.3, ease: "easeInOut" },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* SearchFilters di sidebar */}
        <div className="hidden lg:block lg:w-1/4 lg:sticky lg:top-24 self-start">
          <SearchFilters />
        </div>

        <div className="lg:w-3/4 w-full">
          <BreadcrumbNav items={breadcrumbItems} />
          <h1 className="text-sm lg:text-lg font-medium text-gray-700 mb-4">
            {searchQuery
              ? `Hasil pencarian untuk "${searchQuery}"`
              : "Menampilkan"}
            {!loading && ` ${processedProducts.length} Mobil`}
          </h1>

          {/* Panggil ActiveSearchFilters  */}
          {!loading && searchParams.toString().length > 0 && (
            <ActiveSearchFilters
              searchParams={searchParams}
              splitResult={splitSearchFilter}
              onClearAll={handleClearAllFilters}
              onRemoveSearchPart={handleRemoveSearchPart}
              onRemoveFilterParam={handleRemoveFilterParam}
              isAdminRoute={false}
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

          {/* ShortProduct (Filter Cepat) */}
          <ShortProduct
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
            skeletonCount={PRODUCTS_PER_PAGE}
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

      {!isMobileSearchFiltersOpen && (
        <button
          onClick={() => setIsMobileSearchFiltersOpen(true)}
          className="lg:hidden fixed bottom-30 -left-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-r-full shadow-lg z-40 flex items-center gap-2 hover:from-orange-600 hover:to-orange-700 transition-all duration-300" // Sedikit penyesuaian style
          aria-label="Buka Filter"
        >
          <Filter className="w-4 h-4" />
        </button>
      )}

      <AnimatePresence>
        {isMobileSearchFiltersOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="mobile-filter-overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsMobileSearchFiltersOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              aria-hidden="true"
            />

            {/* Panel Konten Filter */}
            <motion.div
              key="mobile-filter-panel"
              variants={mobileFilterPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed bottom-0 right-0 w-2/3 h-screen bg-white rounded-l-2xl shadow-xl z-50 flex flex-col lg:hidden"
            >
              {/* Header Panel */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-medium text-gray-800">
                  Filter Mobil
                </h2>
                <button
                  onClick={() => setIsMobileSearchFiltersOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                  aria-label="Tutup Filter"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto rounded-bl-2xl mb-2">
                <SearchFilters
                  onActionComplete={() => setIsMobileSearchFiltersOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarShop;
