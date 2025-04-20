// components/product/AllProducts.jsx
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
  const { products, loading, error, updateProductStatus, deleteProduct } =
    useProducts();
  const [isDropdownOpen, setIsDropdownOpen] = useState({});
  const dropdownRefs = useRef({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchQuery, setSearchQuery } = useSidebar();
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 4;

  useEffect(() => {
    const urlSearchQuery = searchParams.get("search");

    // Jika URL punya query search
    if (urlSearchQuery) {
      // Jika query URL berbeda dengan query di context, update context
      if (urlSearchQuery !== searchQuery) {
        console.log("Syncing URL query to context:", urlSearchQuery);
        setSearchQuery(urlSearchQuery);
      }
    }
    // Jika URL TIDAK punya query search
    else {
      // Jika context MASIH punya query, kosongkan context
      if (searchQuery) {
        console.log("Clearing context query because URL is empty");
        setSearchQuery(""); // Pastikan context juga kosong
      }
    }
    // Dependency tetap sama, pastikan searchQuery ada di dependency array
    // agar bisa mendeteksi perubahan dari context juga (misal dari header)
  }, [searchParams, searchQuery, setSearchQuery]);

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const result = await deleteProduct(productId);
      if (result.success) {
        alert("Product deleted successfully");
      } else {
        alert(result.error);
      }
    }
  };

  const handleStatusChange = async (productId, newStatus) => {
    const result = await updateProductStatus(productId, newStatus);
    if (result.success) {
      closeDropdown(productId);
    } else {
      alert(result.error);
    }
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

  const toggleDropdown = (productId) => {
    setIsDropdownOpen((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const closeDropdown = (productId) => {
    setIsDropdownOpen((prev) => ({ ...prev, [productId]: false }));
  };

  const { processedProducts, suggestedQuery, activeFilter, setActiveFilter } =
    useFilterAndSuggest({
      initialProducts: products || [],
      searchQuery: searchQuery,
      initialFilter: SHORT_BY.LATEST,
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
      },
      isLoading: loading,
    });

  const splitSearchFilter = useMemo(() => {
    const result = { brand: null, modelQuery: null, fullQuery: searchQuery };
    if (!searchQuery) return result;

    const productsSource = products || [];
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
  }, [searchQuery, products]);

  const handleClearAllAdminFilters = () => {
    // Hapus hanya query 'search' dari URL admin
    const currentPath = window.location.pathname; // Tetap di halaman admin
    router.push(currentPath); // Navigasi ke path tanpa query
    setSearchQuery(""); // Juga clear context sidebar
  };

  const handleRemoveAdminSearchPart = (partToRemove) => {
    let newSearchQuery = "";
    const currentPath = window.location.pathname;

    if (partToRemove === "brand" && splitSearchFilter.modelQuery) {
      newSearchQuery = splitSearchFilter.modelQuery;
    } else if (partToRemove === "model" && splitSearchFilter.brand) {
      newSearchQuery = splitSearchFilter.brand;
    }
    // Jika partToRemove 'full' atau bagian terakhir, query jadi kosong

    setSearchQuery(newSearchQuery); // Update context sidebar

    if (newSearchQuery) {
      router.push(
        `${currentPath}?search=${encodeURIComponent(newSearchQuery)}`
      );
    } else {
      router.push(currentPath); // Hapus query jika kosong
    }
  };

  // Handler ini kemungkinan tidak akan dipanggil di admin, tapi perlu ada
  const handleRemoveAdminFilterParam = (paramName) => {
    console.warn(
      `Attempted to remove URL filter param "${paramName}" from admin page. This is not expected.`
    );
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, activeFilter]);

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

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  const isPriceFilterActive = [
    SHORT_BY.PRICE_UNDER_150,
    SHORT_BY.PRICE_BETWEEN_150_300,
    SHORT_BY.PRICE_OVER_300,
  ].includes(activeFilter);

  let emptyMessage = "Belum ada produk mobil tersedia.";
  if (searchQuery) {
    emptyMessage = `Tidak ada produk mobil yang cocok dengan pencarian "${searchQuery}".`;
    if (activeFilter !== SHORT_BY.LATEST || isPriceFilterActive) {
      emptyMessage += ` Coba sesuaikan filter Anda atau periksa ejaan pencarian.`;
    }
  } else if (activeFilter !== SHORT_BY.LATEST || isPriceFilterActive) {
    emptyMessage = `Tidak ada produk mobil yang cocok dengan filter yang dipilih.`;
  }

  const breadcrumbItems = [
    { label: "Beranda", href: "/admin" },
    { label: "Produk", href: "" },
  ];

  return (
    <div className="">
      <BreadcrumbNav items={breadcrumbItems} />

      <h1 className="mb-4 text-xl font-medium">Produk Manajemen</h1>
      <div className="mb-4 flex flex-col-reverse lg:flex-row lg:justify-between lg:items-end ">
        <h1 className="text-sm lg:text-lg font-medium text-gray-700 ">
          {" "}
          {searchQuery
            ? `Hasil pencarian untuk "${searchQuery}"`
            : "Menampilkan"}
          {!loading && ` ${processedProducts.length} Mobil`}
        </h1>

        <div className="flex items-end justify-end">
          <button
            onClick={() => router.push("/admin/products/add-product")}
            className="flex items-center space-x-1 px-3 py-1 lg:px-4 lg:py-2 rounded-full border border-orange-500 bg-orange-100 hover:bg-orange-500
          cursor-pointer transition-colors mb-4 lg:mb-0 group"
          >
            <Plus className="text-orange-500 group-hover:text-white w-4 md:w-5" />
            <span className="text-xs md:text-sm mt-1 text-orange-500 group-hover:text-white">
              Tambah Produk
            </span>
          </button>
        </div>
      </div>

      {!loading && searchQuery && (
        <ActiveSearchFilters
          searchParams={searchParams} // Kirim searchParams (meskipun filter detail tidak dipakai)
          splitResult={splitSearchFilter}
          onClearAll={handleClearAllAdminFilters}
          onRemoveSearchPart={handleRemoveAdminSearchPart}
          onRemoveFilterParam={handleRemoveAdminFilterParam} // Handler dummy
        />
      )}
      {!loading &&
        processedProducts.length === 0 &&
        suggestedQuery &&
        searchQuery && (
          <p className="mt-1 mb-3 text-sm text-gray-600">
            Mungkin maksud Anda:{" "}
            <Link
              href={`?search=${encodeURIComponent(suggestedQuery)}`}
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
          setActiveFilter={setActiveFilter}
          excludeFilters={[SHORT_BY.RECOMMENDATION]}
          isAdminRoute={true}
        />
      </div>

      {/* Daftar Produk */}
      <CarProductCard
        products={currentProducts}
        loading={loading}
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

      {/* Pagination */}
      {!loading &&
        currentProducts.length > 0 &&
        processedProducts.length > productsPerPage && (
          <Pagination
            pageCount={Math.ceil(processedProducts.length / productsPerPage)}
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
              ? `?search=${encodeURIComponent(suggestedQuery)}`
              : null
          }
          onSuggestionClick={() =>
            suggestedQuery && setSearchQuery(suggestedQuery)
          }
        />
      )}
    </div>
  );
};
export default AllProducts;
