// frontend/src/components/hedaer-user/SearchModal.jsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { useProducts } from "@/context/ProductContext";
import { SHORT_BY } from "@/components/global/ShortProduct";
import { motion } from "framer-motion";
import axiosInstance from "@/utils/axiosInstance";
import useSWR from "swr";
import Image from "next/image";

const fetcher = (url) =>
  axiosInstance.get(url).then((res) => res.data?.data || []);

const SearchModal = () => {
  const {
    data: allCarData = [],
    error: carDataError,
    isLoading: isLoadingCarData,
  } = useSWR("/api/car-data/all-data", fetcher);

  const router = useRouter();
  const { toggleSearch } = useHeader();
  const { products } = useProducts();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const handleNavigate = (params) => {
    const queryString = new URLSearchParams(params).toString();
    router.push(`/beli?${queryString}`);
    toggleSearch();
  };

  const popularBrands = useMemo(() => {
    if (
      !products ||
      products.length === 0 ||
      !allCarData ||
      allCarData.length === 0
    )
      return [];

    const brandViewCounts = products.reduce((acc, product) => {
      if (product.brand) {
        const brandLower = product.brand.toLowerCase();
        acc[brandLower] = (acc[brandLower] || 0) + (product.viewCount || 0);
      }
      return acc;
    }, {});

    const sortedBrandsByViews = Object.entries(brandViewCounts)
      .sort(([, viewsA], [, viewsB]) => viewsB - viewsA)
      .slice(0, 10);

    return sortedBrandsByViews.map(([brandLower]) => {
      const brandDataFromApi = allCarData.find(
        (b) => b.brandName.toLowerCase() === brandLower
      );
      return {
        name:
          brandDataFromApi?.brandName ||
          brandLower.charAt(0).toUpperCase() + brandLower.slice(1),
        ImgUrl: brandDataFromApi?.imgUrl || "/images/Carbrand/default.png",
      };
    });
  }, [products, allCarData]);

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

    return sortedCombinations.slice(0, 10).map(([combination]) => combination);
  }, [products]);

  const quickChoices = [
    { label: "Mobil Rekomendasi", params: { sort: SHORT_BY.RECOMMENDATION } },
    { label: "Mobil Terbaru", params: { sort: SHORT_BY.LATEST } },
    { label: "Tahun Terbaru", params: { sort: SHORT_BY.YEAR_DESC } },
    { label: "Harga Terendah", params: { sort: SHORT_BY.PRICE_ASC } },
    { label: "Dibawah 150 Jt", params: { sort: SHORT_BY.PRICE_UNDER_150 } },
    { label: "150-300 Jt", params: { sort: SHORT_BY.PRICE_BETWEEN_150_300 } },
    { label: "Diatas 300 Jt", params: { sort: SHORT_BY.PRICE_OVER_300 } },
  ];

  const modalVariants = {
    hidden: { opacity: 0, y: 20, transition: { duration: 0.2 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  if (isLoadingCarData) {
    return (
      <motion.div
        className="bg-white lg:rounded-2xl lg:shadow-lg p-4 lg:w-1/2 mx-auto text-center text-gray-600"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        Memuat data...
      </motion.div>
    );
  }

  if (carDataError) {
    return (
      <motion.div
        className="bg-white lg:rounded-2xl lg:shadow-lg p-4 lg:w-1/2 mx-auto text-center text-red-500"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        Gagal memuat data merek mobil.
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white lg:rounded-2xl lg:shadow-lg p-4 lg:w-1/2 mx-auto"
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Bagian Pencarian Teratas */}
      <div className="mb-4">
        <h3 className="text-sm lg:text-md font-medium text-gray-700">
          Pencarian Teratas
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {topSearches.length > 0 ? (
            topSearches.map((searchTerm) => (
              <button
                key={searchTerm}
                onClick={() => handleNavigate({ search: searchTerm })}
                className={`text-xs rounded-full transition-colors cursor-pointer ${
                  isMobile
                    ? "py-1 px-2 bg-gray-100 text-gray-700"
                    : "py-1 px-3 bg-gray-50 text-gray-700 border border-gray-100 hover:bg-orange-100 hover:text-orange-500  hover:border-orange-500"
                }`}
              >
                {searchTerm}
              </button>
            ))
          ) : (
            <p className="text-xs text-gray-500">Tidak ada data.</p>
          )}
        </div>
      </div>

      {/* Bagian Merek Populer */}
      <div className="mb-4">
        <h3 className="text-sm lg:text-md font-medium text-gray-700">
          Merek Populer
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {popularBrands.length > 0 ? (
            popularBrands.map((brandItem) => (
              <button
                key={brandItem.name}
                onClick={() => handleNavigate({ search: brandItem.name })}
                className="flex flex-col items-center group cursor-pointer"
              >
                {brandItem.ImgUrl && (
                  <Image
                    src={brandItem.ImgUrl}
                    alt={`${brandItem.name} logo`}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain"
                  />
                )}
                <span
                  className={`text-xs rounded-full transition-colors cursor-pointer group ${
                    isMobile
                      ? "py-1 px-2 bg-gray-100 text-gray-700"
                      : "py-.5 px-2 bg-gray-50 text-gray-700 border border-gray-100 group-hover:bg-orange-100 group-hover:text-orange-500 group-hover:border-orange-500"
                  }`}
                >
                  {brandItem.name}
                </span>
              </button>
            ))
          ) : (
            <p className="text-xs text-gray-500">Tidak ada data.</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm lg:text-md font-medium text-gray-700">
          Pilihan Cepat
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {quickChoices.map((choice) => (
            <button
              key={choice.label}
              onClick={() => handleNavigate(choice.params)}
              className={`text-xs rounded-full transition-colors cursor-pointer ${
                isMobile
                  ? "py-1 px-2 bg-gray-100 text-gray-700"
                  : "py-1 px-3 bg-gray-50 text-gray-700 border border-gray-100 hover:bg-orange-100 hover:text-orange-500 hover:border-orange-500"
              }`}
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
