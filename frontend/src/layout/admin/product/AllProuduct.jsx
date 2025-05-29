// frontend/src/layout/admin/product/AllProuduct.jsx
"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSidebar } from "@/context/SidebarContext";
import { useProducts } from "@/context/ProductContext";

// Import Components
import ShortProduct, { SHORT_BY } from "@/components/global/ShortProduct";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import { useFilterAndSuggest } from "@/hooks/useFilterAndSuggest";
import ActiveSearchFilters from "@/components/global/ActiveSearchFilter";
import CarProductCard from "@/components/global/CarProductCard";
import EmptyProductDisplay from "@/components/global/EmptyProductDisplay";
import Pagination from "@/components/global/Pagination";

// Import Icons
import { Plus } from "lucide-react";

const AllProducts = () => {
  const {
    products: allFetchedProducts,
    loading: swrIsLoading,
    error,
    updateProductStatus,
    deleteProduct,
  } = useProducts();

  const [isDropdownOpen, setIsDropdownOpen] = useState({});
  const dropdownRefs = useRef({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchQuery, setSearchQuery } = useSidebar();
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 12;

  useEffect(() => {
    const urlSearchQuery = searchParams.get("search");
    if (urlSearchQuery && urlSearchQuery !== searchQuery) {
      setSearchQuery(urlSearchQuery);
    } else if (!urlSearchQuery && searchQuery) {
      setSearchQuery("");
    }
  }, [searchParams, searchQuery, setSearchQuery]);

  const closeDropdown = (productId) => {
    setIsDropdownOpen((prev) => ({ ...prev, [productId]: false }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRefs.current) {
        Object.keys(dropdownRefs.current).forEach((productId) => {
          if (
            dropdownRefs.current[productId] &&
            !dropdownRefs.current[productId].contains(event.target)
          ) {
            closeDropdown(productId);
          }
        });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDelete = async (productId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      await deleteProduct(productId);
    }
  };

  const handleStatusChange = async (productId, newStatus) => {
    await updateProductStatus(productId, newStatus);
    closeDropdown(productId);
  };

  const toggleDropdown = (productId) => {
    setIsDropdownOpen((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const { processedProducts, suggestedQuery, activeFilter } =
    useFilterAndSuggest({
      initialProducts: allFetchedProducts || [],
      searchQuery: searchQuery,
      options: {
        searchFields: [
          "carName",
          "brand",
          "model",
          "year",
          "price",
          "plateNumber",
        ],
        suggestionTargets: ["brand", "model", "carName", "plateNumber"],
        defaultSort: SHORT_BY.LATEST,
      },
      isLoading: swrIsLoading,
    });

  const splitSearchFilter = useMemo(() => {
    const result = { brand: null, modelQuery: null, fullQuery: searchQuery };
    if (!searchQuery || !allFetchedProducts || allFetchedProducts.length === 0)
      return result;
    const uniqueBrands = [
      ...new Set(
        allFetchedProducts.map((p) => p.brand?.toLowerCase()).filter(Boolean)
      ),
    ];
    uniqueBrands.sort((a, b) => b.length - a.length);
    for (const brand of uniqueBrands) {
      if (
        searchQuery.toLowerCase().startsWith(brand + " ") ||
        searchQuery.toLowerCase() === brand
      ) {
        const originalBrandName =
          allFetchedProducts.find((p) => p.brand?.toLowerCase() === brand)
            ?.brand || brand.charAt(0).toUpperCase() + brand.slice(1);
        result.brand = originalBrandName;
        result.modelQuery = searchQuery.toLowerCase().startsWith(brand + " ")
          ? searchQuery.substring(brand.length).trim()
          : "";
        if (!result.modelQuery) result.modelQuery = null;
        return result;
      }
    }
    result.modelQuery = searchQuery;
    return result;
  }, [searchQuery, allFetchedProducts]);

  const handleClearAllAdminFilters = () => {
    const currentPath = window.location.pathname;
    router.push(currentPath);
    setSearchQuery("");
  };

  const handleRemoveAdminSearchPart = (partToRemove) => {
    let newSearchQuery = "";
    const currentPath = window.location.pathname;
    if (partToRemove === "brand" && splitSearchFilter.modelQuery)
      newSearchQuery = splitSearchFilter.modelQuery;
    else if (partToRemove === "model" && splitSearchFilter.brand)
      newSearchQuery = splitSearchFilter.brand;
    setSearchQuery(newSearchQuery);
    router.push(
      newSearchQuery
        ? `${currentPath}?search=${encodeURIComponent(newSearchQuery)}`
        : currentPath
    );
  };

  const handleRemoveAdminFilterParam = () => {
    console.warn(
      "URL filter param removal not typically used in admin product list."
    );
  };

  const handleAdminSortChange = (newSortValue) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("sort", newSortValue);
    const currentPath = window.location.pathname;
    setCurrentPage(0);
    router.push(`${currentPath}?${currentParams.toString()}`, {
      scroll: false,
    });
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, searchParams, activeFilter]);

  const indexOfLastProduct = (currentPage + 1) * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = processedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handlePageChange = (data) => {
    setCurrentPage(data.selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  let emptyMessage = "Belum ada produk mobil tersedia.";
  if (searchQuery) {
    emptyMessage = `Tidak ada produk mobil yang cocok dengan pencarian "${searchQuery}".`;
  } else if (
    activeFilter !== SHORT_BY.LATEST &&
    ![
      SHORT_BY.PRICE_UNDER_150,
      SHORT_BY.PRICE_BETWEEN_150_300,
      SHORT_BY.PRICE_OVER_300,
    ].includes(activeFilter)
  ) {
    emptyMessage = `Tidak ada produk mobil yang cocok dengan filter yang dipilih.`;
  }

  const breadcrumbItems = [
    { label: "Beranda", href: "/admin" },
    { label: "Katalog Produk", href: "" },
  ];

  return (
    <div className="my-6 md:my-0 relative">
      <BreadcrumbNav items={breadcrumbItems} />
      <div className="flex items-end justify-end px-3 md:px-0">
        <Link
          href="/admin/produk/tambah-produk"
          className="flex items-start space-x-1 px-3 py-1 lg:px-4 lg:py-2 rounded-full border border-orange-500 bg-orange-100 hover:bg-gradient-to-r from-orange-400 to-orange-600 hover:text-white text-orange-500 font-medium cursor-pointer transition-colors mb-4 lg:mb-0"
        >
          <Plus className="w-4 md:w-5" />
          <span className="text-xs md:text-sm mt-1">Tambah Produk</span>
        </Link>
      </div>

      <div className="mb-4">
        <h1 className="text-md lg:text-lg font-medium text-gray-700 px-3 md:px-0">
          {searchQuery
            ? `Hasil pencarian untuk "${searchQuery}"`
            : "Menampilkan"}
          {` ${processedProducts.length} Produk Mobil`}
        </h1>
      </div>

      {searchQuery && (
        <ActiveSearchFilters
          searchParams={searchParams}
          splitResult={splitSearchFilter}
          onClearAll={handleClearAllAdminFilters}
          onRemoveSearchPart={handleRemoveAdminSearchPart}
          onRemoveFilterParam={handleRemoveAdminFilterParam}
          isAdminRoute={true}
        />
      )}
      {processedProducts.length === 0 && suggestedQuery && searchQuery && (
        <p className="mt-1 mb-3 text-sm text-gray-600 px-3 md:px-0">
          Mungkin maksud Anda:{" "}
          <Link
            href={`/admin/produk?search=${encodeURIComponent(suggestedQuery)}`}
            className="text-orange-500 hover:underline font-medium"
            onClick={() => setSearchQuery(suggestedQuery)}
          >
            {suggestedQuery}
          </Link>
          ?
        </p>
      )}

      <div className="mt-4">
        <ShortProduct
          activeFilter={activeFilter}
          onSortChange={handleAdminSortChange}
          excludeFilters={[SHORT_BY.RECOMMENDATION]}
          isAdminRoute={true}
        />
      </div>

      <CarProductCard
        products={currentProducts}
        loading={false}
        error={error}
        isAdminRoute={true}
        handleStatusChange={handleStatusChange}
        handleDelete={handleDelete}
        toggleDropdown={toggleDropdown}
        isDropdownOpen={isDropdownOpen}
        dropdownRefs={dropdownRefs}
        emptyMessage={null}
        skeletonCount={productsPerPage}
      />

      {currentProducts.length > 0 &&
        processedProducts.length > productsPerPage && (
          <Pagination
            key={`pagination-${searchParams.toString()}-${currentPage}`}
            pageCount={Math.ceil(processedProducts.length / productsPerPage)}
            forcePage={currentPage}
            onPageChange={handlePageChange}
          />
        )}

      {processedProducts.length === 0 && !error && (
        <EmptyProductDisplay
          emptyMessage={emptyMessage}
          suggestedQuery={suggestedQuery}
          searchQuery={searchQuery}
          suggestionLinkHref={
            suggestedQuery
              ? `/admin/produk?search=${encodeURIComponent(suggestedQuery)}`
              : null
          }
          onSuggestionClick={() =>
            suggestedQuery && setSearchQuery(suggestedQuery)
          }
          isAdminRoute={true}
        />
      )}

      {error && (
        <div className="text-center p-4 text-red-500">
          Error: {error.message || "Gagal memuat data produk."}
        </div>
      )}
    </div>
  );
};
export default AllProducts;
