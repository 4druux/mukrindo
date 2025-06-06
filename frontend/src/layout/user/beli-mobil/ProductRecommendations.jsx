"use client";

import React from "react";
import CarProductCardSwipe from "@/components/product-user/home/CarProductCardSwipe";
import TittleText from "@/components/common/TittleText";

const ProductRecommendations = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
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
