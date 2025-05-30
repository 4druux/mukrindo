// frontend/src/layout/user/beli/BuyCar.jsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProducts } from "@/context/ProductContext"; //
import { Filter, X } from "lucide-react"; //
import ShortProduct, {
  SHORT_BY,
  filterLabels,
} from "@/components/global/ShortProduct"; //
import Pagination from "@/components/global/Pagination"; //
import BreadcrumbNav from "@/components/common/BreadcrumbNav"; //
import { useFilterAndSuggest } from "@/hooks/useFilterAndSuggest"; //
import CarProductCard from "@/components/global/CarProductCard"; //
import ActiveSearchFilters from "@/components/global/ActiveSearchFilter"; //
import EmptyProductDisplay from "@/components/global/EmptyProductDisplay"; //
import SearchFilters from "@/components/product-user/beli/SearchFilters"; //
import { AnimatePresence, motion } from "framer-motion"; //

const VIEWED_PRODUCTS_KEY = "viewedCarProducts"; //
const MAX_VIEWED_ITEMS = 10; //
const PRODUCTS_PER_PAGE = 12; //
const MAX_FILTER_RECOMMENDATIONS = 9; //

const getRecentlyViewed = () => {
  //
  if (typeof window === "undefined") return []; //
  const items = localStorage.getItem(VIEWED_PRODUCTS_KEY); //
  return items ? JSON.parse(items) : []; //
};

const addRecentlyViewed = (product) => {
  //
  if (typeof window === "undefined" || !product) return; //
  const viewed = getRecentlyViewed(); //
  const newItem = {
    //
    id: product._id, //
    brand: product.brand, //
    model: product.model, //
    variant: product.variant, //
  };

  const filteredViewed = viewed.filter((item) => item.id !== newItem.id); //
  const updatedViewed = [newItem, ...filteredViewed].slice(0, MAX_VIEWED_ITEMS); //
  localStorage.setItem(VIEWED_PRODUCTS_KEY, JSON.stringify(updatedViewed)); //
};

const BuyCar = () => {
  const { products, loading, error } = useProducts(); //
  const searchParams = useSearchParams(); //
  const router = useRouter(); //
  const [recentlyViewed, setRecentlyViewed] = useState([]); //
  const [currentPage, setCurrentPage] = useState(0); //
  const [isMobileSearchFiltersOpen, setIsMobileSearchFiltersOpen] =
    useState(false); //
  const [filterBasedRecommendations, setFilterBasedRecommendations] = useState(
    []
  ); //

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed()); //
  }, []);

  const searchQuery = useMemo(
    () => searchParams.get("search") || "",
    [searchParams]
  ); //
  const sBrand = useMemo(() => searchParams.get("brand"), [searchParams]); //
  const sModel = useMemo(() => searchParams.get("model"), [searchParams]); //
  const sType = useMemo(() => searchParams.get("type"), [searchParams]); //
  const sTransmission = useMemo(
    () => searchParams.get("transmission"),
    [searchParams]
  ); //
  const sFuelType = useMemo(() => searchParams.get("fuelType"), [searchParams]); //
  const sYearMin = useMemo(() => searchParams.get("yearMin"), [searchParams]); //
  const sYearMax = useMemo(() => searchParams.get("yearMax"), [searchParams]); //
  const sPriceMin = useMemo(() => searchParams.get("priceMin"), [searchParams]); //
  const sPriceMax = useMemo(() => searchParams.get("priceMax"), [searchParams]); //

  const { processedProducts, suggestedQuery, activeFilter, setActiveFilter } =
    useFilterAndSuggest({
      //
      initialProducts:
        products && products.length > 0 ? products : products || [], //
      searchQuery: searchQuery, //
      options: {
        //
        recentlyViewed: recentlyViewed, //
        searchFields: [
          //
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
        suggestionTargets: ["brand", "model", "carName"], //
        defaultSort: SHORT_BY.RECOMMENDATION, //
      },
      isLoading: loading, //
    });

  const splitSearchFilter = useMemo(() => {
    //
    const result = {
      //
      brand: null, //
      modelQuery: null, //
      fullQuery: searchQuery, //
    };
    if (!searchQuery) return result; //

    const productsSource =
      products && products.length > 0 ? products : products || []; //
    if (productsSource.length === 0) return result; //

    const uniqueBrands = [
      //
      ...new Set(
        productsSource.map((p) => p.brand?.toLowerCase()).filter(Boolean) //
      ),
    ];
    uniqueBrands.sort((a, b) => b.length - a.length); //

    let foundBrand = null; //
    let remainingQuery = searchQuery; //
    let originalBrandName = null; //

    for (const brand of uniqueBrands) {
      //
      if (
        searchQuery.toLowerCase().startsWith(brand + " ") || //
        searchQuery.toLowerCase() === brand //
      ) {
        originalBrandName =
          productsSource.find((p) => p.brand?.toLowerCase() === brand)?.brand || //
          brand.charAt(0).toUpperCase() + brand.slice(1); //
        foundBrand = brand; //
        if (searchQuery.toLowerCase().startsWith(brand + " ")) {
          //
          remainingQuery = searchQuery.substring(brand.length).trim(); //
        } else {
          remainingQuery = ""; //
        }
        break;
      }
    }

    if (originalBrandName) {
      //
      result.brand = originalBrandName; //
      result.modelQuery = remainingQuery || null; //
    } else {
      result.modelQuery = searchQuery; //
    }

    return result; //
  }, [searchQuery, products]);

  const breadcrumbItems = useMemo(() => {
    //
    const items = [
      //
      { label: "Beranda", href: "/" }, //
      { label: "Beli Mobil", href: "/beli" }, //
    ];

    if (splitSearchFilter.brand) {
      //
      items.push({
        //
        label: splitSearchFilter.brand, //
        href: `/beli?search=${encodeURIComponent(splitSearchFilter.brand)}`, //
      });
      if (splitSearchFilter.modelQuery) {
        //
        items.push({ label: splitSearchFilter.modelQuery, href: "" }); //
        items[items.length - 2].href = `/beli?search=${encodeURIComponent(
          //
          splitSearchFilter.brand
        )}`;
      } else {
        items[items.length - 1].href = ""; //
      }
      items[1].href = "/beli"; //
    } else if (searchQuery) {
      //
      items.push({ label: `Pencarian: "${searchQuery}"`, href: "" }); //
      items[1].href = "/beli"; //
    } else {
      items[1].href = ""; //
    }

    const urlParams = new URLSearchParams(searchParams); //
    const activeUrlFilters = []; //
    if (urlParams.get("brand"))
      activeUrlFilters.push(`${urlParams.get("brand")}`); //
    if (urlParams.get("model"))
      activeUrlFilters.push(`${urlParams.get("model")}`); //

    if (
      activeUrlFilters.length > 0 && //
      !splitSearchFilter.brand && //
      !searchQuery //
    ) {
      items.push({ label: `${activeUrlFilters.join(", ")}`, href: "" }); //
      items[1].href = "/beli"; //
    }

    return items; //
  }, [searchQuery, splitSearchFilter, searchParams]);

  const indexOfLastProduct = (currentPage + 1) * PRODUCTS_PER_PAGE; //
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE; //
  const currentProducts = processedProducts.slice(
    //
    indexOfFirstProduct, //
    indexOfLastProduct //
  );

  const handlePageChange = (data) => {
    //
    setCurrentPage(data.selected); //
    window.scrollTo({ top: 0, behavior: "smooth" }); //
  };

  useEffect(() => {
    setCurrentPage(0); //
  }, [searchParams]);

  const handleProductClick = (product) => {
    //
    addRecentlyViewed(product); //
  };

  if (error) {
    //
    return (
      <div className="text-red-500 text-center mt-4 p-6">Error: {error}</div> //
    );
  }

  const isDetailedFilterActive = useMemo(() => {
    //
    return [
      //
      sBrand, //
      sModel, //
      sType, //
      sTransmission, //
      sFuelType, //
      sYearMin, //
      sYearMax, //
      sPriceMin, //
      sPriceMax, //
    ].some((val) => val !== null && val !== undefined && val !== ""); //
  }, [
    sBrand, //
    sModel, //
    sType, //
    sTransmission, //
    sFuelType, //
    sYearMin, //
    sYearMax, //
    sPriceMin, //
    sPriceMax, //
  ]);

  let emptyMessage = "Belum ada produk mobil tersedia."; //

  if (searchQuery) {
    //
    emptyMessage = `Tidak ada produk mobil yang cocok dengan pencarian "${searchQuery}".`; //
    if (isDetailedFilterActive) {
      //
      emptyMessage += ` Coba sesuaikan filter Anda atau periksa ejaan pencarian.`; //
    }
  } else if (isDetailedFilterActive) {
    //
    emptyMessage = `Tidak ada produk mobil yang cocok dengan filter yang dipilih.`; //
  } else if (
    activeFilter &&
    filterLabels[activeFilter] &&
    activeFilter !== SHORT_BY.RECOMMENDATION &&
    activeFilter !== SHORT_BY.LATEST
  ) {
    // MODIFIED: Use filterLabels for user-friendly message
    emptyMessage = `Tidak ada produk mobil yang cocok dengan filter "${filterLabels[activeFilter]}".`;
  }

  useEffect(() => {
    let brandForRecommendation = null; //
    let modelForRecommendation = null; //
    let shouldAttemptRecommendation = false; //

    if (processedProducts.length === 0 && !loading) {
      //
      if (searchQuery && splitSearchFilter.brand) {
        //
        brandForRecommendation = splitSearchFilter.brand.toLowerCase(); //
        modelForRecommendation = splitSearchFilter.modelQuery //
          ? splitSearchFilter.modelQuery.toLowerCase() //
          : null;
        shouldAttemptRecommendation = true; //
      } else if (!searchQuery && isDetailedFilterActive) {
        //
        if (sBrand) {
          //
          brandForRecommendation = sBrand.toLowerCase(); //
          modelForRecommendation = sModel ? sModel.toLowerCase() : null; //
          shouldAttemptRecommendation = true; //
        }
      }
    }

    if (shouldAttemptRecommendation && brandForRecommendation) {
      //
      const allAvailableProducts = products || []; //
      let potentialRecommendations = []; //

      const brandMatches = allAvailableProducts.filter(
        //
        (p) => p.brand && p.brand.toLowerCase() === brandForRecommendation //
      );

      if (modelForRecommendation && brandMatches.length > 0) {
        //
        let modelMatches = brandMatches.filter(
          //
          (p) => p.model && p.model.toLowerCase() === modelForRecommendation //
        );

        if (modelMatches.length > 0) {
          //
          potentialRecommendations = modelMatches; //
        } else {
          modelMatches = brandMatches.filter(
            //
            (p) =>
              p.model && p.model.toLowerCase().includes(modelForRecommendation) //
          );
          if (modelMatches.length > 0) {
            //
            potentialRecommendations = modelMatches; //
          } else {
            potentialRecommendations = brandMatches; //
          }
        }
      } else {
        potentialRecommendations = brandMatches; //
      }

      const newRecommendations = potentialRecommendations.slice(
        //
        0, //
        MAX_FILTER_RECOMMENDATIONS //
      );

      if (
        JSON.stringify(newRecommendations) !==
        JSON.stringify(filterBasedRecommendations) //
      ) {
        setFilterBasedRecommendations(newRecommendations); //
      }
    } else {
      if (filterBasedRecommendations.length > 0) {
        //
        setFilterBasedRecommendations([]); //
      }
    }
  }, [
    processedProducts, //
    loading, //
    searchQuery, //
    splitSearchFilter, //
    isDetailedFilterActive, //
    sBrand, //
    sModel, //
    products, //
    filterBasedRecommendations, //
  ]);

  const shouldShowFilterRecsProp =
    processedProducts.length === 0 && //
    !loading && //
    ((searchQuery && splitSearchFilter.brand) || //
      (!searchQuery && isDetailedFilterActive)) && //
    filterBasedRecommendations.length > 0; //

  const handleClearAllFilters = () => {
    //
    router.push("/beli"); //
  };

  const handleRemoveSearchPart = (partToRemove) => {
    //
    const currentParams = new URLSearchParams(searchParams); //
    let newSearchQuery = ""; //

    if (partToRemove === "brand" && splitSearchFilter.modelQuery) {
      //
      newSearchQuery = splitSearchFilter.modelQuery; //
    } else if (partToRemove === "model" && splitSearchFilter.brand) {
      //
      newSearchQuery = splitSearchFilter.brand; //
    }

    if (newSearchQuery) {
      //
      currentParams.set("search", newSearchQuery); //
    } else {
      currentParams.delete("search"); //
    }

    const queryString = currentParams.toString(); //
    router.push(`/beli${queryString ? `?${queryString}` : ""}`); //
  };

  const handleRemoveFilterParam = (paramNameToRemove) => {
    //
    const currentParams = new URLSearchParams(searchParams); //

    if (paramNameToRemove === "priceMin" || paramNameToRemove === "priceMax") {
      //
      currentParams.delete("priceMin"); //
      currentParams.delete("priceMax"); //
    } else if (
      paramNameToRemove === "yearMin" || //
      paramNameToRemove === "yearMax" //
    ) {
      currentParams.delete("yearMin"); //
      currentParams.delete("yearMax"); //
    } else {
      currentParams.delete(paramNameToRemove); //
    }

    const queryString = currentParams.toString(); //
    router.push(`/beli${queryString ? `?${queryString}` : ""}`); //
  };

  const handleSortChange = (newSortValue) => {
    //
    const currentParams = new URLSearchParams(searchParams.toString()); //
    currentParams.set("sort", newSortValue); //
    if (
      newSortValue !== SHORT_BY.PRICE_UNDER_150 && //
      newSortValue !== SHORT_BY.PRICE_BETWEEN_150_300 && //
      newSortValue !== SHORT_BY.PRICE_OVER_300 //
    )
      setCurrentPage(0); //
    router.push(`/beli?${currentParams.toString()}`, { scroll: false }); //
  };

  useEffect(() => {
    document.body.style.overflow = isMobileSearchFiltersOpen //
      ? "hidden"
      : "auto";
    return () => {
      document.body.style.overflow = "auto"; //
    };
  }, [isMobileSearchFiltersOpen]);

  const mobileFilterPanelVariants = {
    //
    hidden: { x: "100%" }, //
    visible: {
      //
      x: 0, //
      transition: { type: "tween", duration: 0.4, ease: "easeInOut" }, //
    },
    exit: {
      //
      x: "100%", //
      transition: { type: "tween", duration: 0.3, ease: "easeInOut" }, //
    },
  };

  const overlayVariants = {
    //
    hidden: { opacity: 0 }, //
    visible: { opacity: 1, transition: { duration: 0.3 } }, //
    exit: { opacity: 0, transition: { duration: 0.3 } }, //
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* SearchFilters di sidebar */}
        <div className="hidden xl:block xl:w-1/4 xl:sticky xl:top-24 self-start">
          <SearchFilters /> {/* */}
        </div>

        <div className="xl:w-3/4 w-full">
          <BreadcrumbNav items={breadcrumbItems} /> {/* */}
          <h1 className="text-md lg:text-lg font-medium text-gray-700 mb-2 lg:mb-4 px-3 md:px-0">
            {searchQuery
              ? `Hasil pencarian untuk "${searchQuery}"` //
              : "Menampilkan"}
            {!loading && ` ${processedProducts.length} Mobil`} {/* */}
          </h1>
          {!loading &&
            searchParams.toString().length > 0 && ( //
              <ActiveSearchFilters
                searchParams={searchParams} //
                splitResult={splitSearchFilter} //
                onClearAll={handleClearAllFilters} //
                onRemoveSearchPart={handleRemoveSearchPart} //
                onRemoveFilterParam={handleRemoveFilterParam} //
                isAdminRoute={false} //
              />
            )}
          {!loading &&
            processedProducts.length === 0 && //
            suggestedQuery && //
            searchQuery && ( //
              <p className="mt-1 mb-3 text-sm text-gray-600 px-3 md:px-0">
                Mungkin maksud Anda{" "}
                <Link
                  href={`/beli?search=${encodeURIComponent(suggestedQuery)}`} //
                  className="text-orange-500 hover:underline font-medium"
                >
                  {suggestedQuery} {/* */}
                </Link>
                ?
              </p>
            )}
          {/* ----- MODIFIED: ShortProduct always rendered if not loading ----- */}
          {!loading && (
            <div className="mt-4">
              <ShortProduct
                activeFilter={activeFilter} //
                onSortChange={handleSortChange} //
              />
            </div>
          )}
          {/* ----- END OF MODIFICATION ----- */}
          <CarProductCard
            products={currentProducts} //
            loading={loading} //
            error={error} //
            onProductClick={handleProductClick} //
            emptyMessage={null}
            BuyCarRoute={true} //
            skeletonCount={PRODUCTS_PER_PAGE} //
          />
          {!loading &&
            currentProducts.length > 0 && //
            processedProducts.length > PRODUCTS_PER_PAGE && ( //
              <Pagination
                key={`pagination-${activeFilter}-${searchQuery}`} //
                pageCount={Math.ceil(
                  //
                  processedProducts.length / PRODUCTS_PER_PAGE //
                )}
                forcePage={currentPage} //
                onPageChange={handlePageChange} //
              />
            )}
          {processedProducts.length === 0 &&
            !loading && ( //
              <EmptyProductDisplay
                emptyMessage={emptyMessage} //
                showFilterRecommendations={shouldShowFilterRecsProp} //
                filterRecommendations={filterBasedRecommendations} //
                onProductClick={handleProductClick} //
                isAdminRoute={false} //
              />
            )}
        </div>
      </div>

      {!isMobileSearchFiltersOpen && ( //
        <button
          onClick={() => setIsMobileSearchFiltersOpen(true)} //
          className="xl:hidden fixed bottom-50 -left-1 bg-gradient-to-r from-orange-300 to-orange-600 text-white px-3 py-2 rounded-r-full shadow-lg z-40 flex items-center gap-2 hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
          aria-label="Buka Filter"
        >
          <Filter className="w-4 h-4" /> {/* */}
        </button>
      )}

      <AnimatePresence>
        {" "}
        {/* */}
        {isMobileSearchFiltersOpen && ( //
          <>
            {/* Overlay */}
            <motion.div
              key="mobile-filter-overlay"
              variants={overlayVariants} //
              initial="hidden" //
              animate="visible" //
              exit="exit" //
              onClick={() => setIsMobileSearchFiltersOpen(false)} //
              className="fixed inset-0 bg-black/60 z-50 xl:hidden"
              aria-hidden="true"
            />

            {/* Panel Konten Filter */}
            <motion.div
              key="mobile-filter-panel"
              variants={mobileFilterPanelVariants} //
              initial="hidden" //
              animate="visible" //
              exit="exit" //
              className="fixed bottom-0 right-0 w-2/3 h-[100dvh] bg-white rounded-l-2xl shadow-xl z-50 flex flex-col xl:hidden" //
            >
              {/* Header Panel */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-medium text-gray-800">
                  Filter Mobil
                </h2>
                <button
                  onClick={() => setIsMobileSearchFiltersOpen(false)} //
                  className="p-1 rounded-full hover:bg-gray-100"
                  aria-label="Tutup Filter"
                >
                  <X className="w-5 h-5 text-gray-600" /> {/* */}
                </button>
              </div>
              <div className="flex-grow overflow-y-auto rounded-bl-2xl mb-2">
                <SearchFilters
                  onActionComplete={() => setIsMobileSearchFiltersOpen(false)} //
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuyCar;
