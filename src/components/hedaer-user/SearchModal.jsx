// components/SearchModal.js
import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { useProducts } from "@/context/ProductContext";
import { SHORT_BY } from "@/components/global/ShortProduct";
import { motion } from "framer-motion";

const SearchModal = () => {
  const router = useRouter();
  const { toggleSearch } = useHeader();
  const { products } = useProducts();

  const handleNavigate = (params) => {
    const queryString = new URLSearchParams(params).toString();
    router.push(`/beli?${queryString}`);
    toggleSearch();
  };

  const popularBrands = useMemo(() => {
    if (!products || products.length === 0) return [];
    const brandViewCounts = products.reduce((acc, product) => {
      if (product.brand) {
        const brandLower = product.brand.toLowerCase();
        acc[brandLower] = (acc[brandLower] || 0) + (product.viewCount || 0);
      }
      return acc;
    }, {});

    const sortedBrandsByViews = Object.entries(brandViewCounts).sort(
      ([, viewsA], [, viewsB]) => viewsB - viewsA
    );

    const topBrandNamesLower = sortedBrandsByViews
      .slice(0, 5)
      .map(([brandLower]) => brandLower);

    const topBrandsOriginalCase = topBrandNamesLower.map((brandLower) => {
      const originalBrand = products.find(
        (p) => p.brand?.toLowerCase() === brandLower
      )?.brand;
      return originalBrand || brandLower;
    });

    return topBrandsOriginalCase;
  }, [products]);

  const topSearches = useMemo(() => {
    if (!products || products.length === 0) return [];

    const combinationViews = products.reduce((acc, product) => {
      if (product.brand && product.model) {
        const key = `${product.brand} ${product.model}`;
        acc[key] = (acc[key] || 0) + (product.viewCount || 0);
      }
      return acc;
    }, {});

    const sortedCombinations = Object.entries(combinationViews).sort(
      ([, viewsA], [, viewsB]) => viewsB - viewsA
    );

    return sortedCombinations.slice(0, 5).map(([combination]) => combination);
  }, [products]);

  const quickChoices = [
    { label: "Mobil Rekomendasi", params: { sort: SHORT_BY.RECOMMENDATION } },
    { label: "Mobil Terbaru", params: { sort: SHORT_BY.LATEST } },
    { label: "Tahun Terbaru", params: { sort: SHORT_BY.YEAR_DESC } },
    { label: "Harga Terendah", params: { sort: SHORT_BY.PRICE_ASC } },
    { label: "Dibawah 150 ", params: { sort: SHORT_BY.PRICE_UNDER_150 } },
    { label: "150-300 Juta", params: { sort: SHORT_BY.PRICE_BETWEEN_150_300 } },
    { label: "Diatas 300 Juta", params: { sort: SHORT_BY.PRICE_OVER_300 } },
  ];

  const modalVariants = {
    hidden: { opacity: 0, y: 20, transition: { duration: 0.2 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-4 w-full sm:w-1/2 mx-auto"
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4">
        <h3 className="text-md font-medium">Pencarian Teratas</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {topSearches.map((searchTerm) => (
            <button
              key={searchTerm}
              onClick={() => handleNavigate({ search: searchTerm })}
              className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {searchTerm}
            </button>
          ))}
          {topSearches.length === 0 && (
            <p className="text-xs text-gray-500">Tidak ada data.</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-md font-medium">Merek Populer</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {popularBrands.map((brand) => (
            <button
              key={brand}
              onClick={() => handleNavigate({ search: brand })}
              className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {brand}
            </button>
          ))}
          {popularBrands.length === 0 && (
            <p className="text-xs text-gray-500">Tidak ada data.</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium">Pilihan Cepat</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {quickChoices.map((choice) => (
            <button
              key={choice.label}
              onClick={() => handleNavigate(choice.params)}
              className="px-3 py-1 rounded-full bg-orange-600 text-white text-sm hover:bg-orange-500 transition-colors cursor-pointer"
            >
              {choice.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchModal;
