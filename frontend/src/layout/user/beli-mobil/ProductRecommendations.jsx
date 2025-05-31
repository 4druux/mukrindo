// frontend/src/components/product-user/beli-mobil/ProductRecommendations.jsx
"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import CarProductCardSwipe from "@/components/product-user/home/CarProductCardSwipe";
import TittleText from "@/components/common/TittleText";
import DotLoader from "@/components/common/DotLoader";

const ProductRecommendations = ({ currentProductId, currentProductForLog }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [errorRecommendations, setErrorRecommendations] = useState(null);

  useEffect(() => {
    if (!currentProductId) {
      setLoadingRecommendations(false);
      return;
    }

    const fetchRecommendations = async () => {
      setLoadingRecommendations(true);
      setErrorRecommendations(null);
      try {
        const response = await axiosInstance.get(
          `/api/products/${currentProductId}/recommendations`
        );
        if (response.data.success) {
          setRecommendations(response.data.recommendations);
        } else {
          console.warn("Gagal mengambil rekomendasi:", response.data.message);
          setRecommendations([]);
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setErrorRecommendations(err.message || "Gagal memuat rekomendasi.");
        setRecommendations([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [currentProductId]);

  if (loadingRecommendations) {
    return (
      <div className="mt-8 md:mt-16">
        <div className="px-3 md:px-0">
          <TittleText
            text="Rekomendasi Mobil Serupa"
            className="mb-2 lg:mb-4"
          />
        </div>
        <div className="flex justify-center items-center h-40">
          <DotLoader text="Memuat rekomendasi..." />
        </div>
      </div>
    );
  }

  if (errorRecommendations) {
    return (
      <div className="mt-8 md:mt-16 px-3 md:px-0">
        <TittleText text="Rekomendasi Mobil Serupa" className="mb-2 lg:mb-4" />
        <p className="text-red-500 text-center">
          Tidak dapat memuat rekomendasi saat ini.
        </p>
      </div>
    );
  }

  if (!loadingRecommendations && recommendations.length === 0) {
    return null;
  }

  return (
    <div className="">
      <div className="px-3 md:px-0">
        <TittleText text="Rekomendasi Mobil Serupa" className="mb-2 lg:mb-4" />
      </div>
      <CarProductCardSwipe
        products={recommendations.slice(0, 8)}
        loading={false}
        skeletonCount={8}
        isRecommendation={true}
      />
    </div>
  );
};

export default ProductRecommendations;
