// frontend/src/components/product-admin/Dashboard/CarInfoSold.jsx
"use client";
import React from "react";
import { FaBoxOpen } from "react-icons/fa";

export const CarInfoSold = ({
  totalSold,
  soldThisMonth,
  soldLastMonth, // <-- Prop baru
  soldTrend,
  renderTrend,
}) => {
  return (
    <div className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6">
      <h2 className="text-md text-gray-700 font-medium">Mobil Terjual</h2>
      <div className="flex items-start justify-start gap-2 mt-2">
        <div className="flex items-center justify-center w-14 h-10 bg-green-100 text-green-600 rounded-lg mb-3">
          <FaBoxOpen className="w-5 h-5" />
        </div>
        <p className="text-xl font-medium text-gray-700 mt-2 text-center">
          {totalSold.toLocaleString("id-ID")}
        </p>
      </div>
      <div className="text-xs text-gray-600 space-y-1">
        <div>
          Terjual Bulan Lalu:{" "}
          <span className="font-semibold">
            {soldLastMonth.toLocaleString("id-ID")}
          </span>
        </div>
        <div>
          Terjual Bulan Ini:{" "}
          <span className="font-semibold">
            {soldThisMonth.toLocaleString("id-ID")}
          </span>
          {soldTrend.show && (
            <span className="ml-1">
              {renderTrend(soldTrend.value, soldTrend.direction)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
