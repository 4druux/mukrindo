// frontend/src/components/skeleton/skeleton-admin/SkeletonInfoCard.jsx
"use client";
import React from "react";

const SkeletonInfoCard = () => {
  return (
    <div className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6 animate-pulse">
      {/* Placeholder for Title */}
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>

      {/* Placeholder for Icon and Main Number */}
      <div className="flex items-start justify-start gap-2 mt-2 mb-4">
        <div className="w-14 h-10 bg-gray-300 rounded-lg"></div>{" "}
        {/* Icon area */}
        <div className="h-6 bg-gray-300 rounded w-1/4 mt-1"></div>{" "}
        {/* Main Number area */}
      </div>

      {/* Placeholder for Sub-text */}
      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
      <div className="h-3 bg-gray-300 rounded w-3/4 mt-2"></div>
      <div className="h-3 bg-gray-300 rounded w-3/4 mt-2"></div>
    </div>
  );
};

export default SkeletonInfoCard;
