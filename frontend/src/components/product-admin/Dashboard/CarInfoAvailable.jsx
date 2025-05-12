// frontend/src/components/product-admin/Dashboard/CarInfoAvailable.jsx
"use client";
import React from "react";
import { FaCar } from "react-icons/fa";

export const CarInfoAvailable = ({
  totalAvailable,
  addedThisMonth,
  addedLastMonth,
  addedTrend,
  renderTrend,
}) => {
  return (
    <div className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5">
      <h2 className="text-md text-gray-700 font-medium">Mobil Tersedia</h2>
      <div className="flex items-start justify-start gap-2 mt-2">
        <div className="flex items-center justify-center w-14 h-10 bg-orange-100 text-orange-600 rounded-lg mb-3">
          <FaCar className="w-5 h-5" />
        </div>
        <p className="text-xl font-semibold text-orange-600 mt-2 text-center">
          {totalAvailable.toLocaleString("id-ID")}
        </p>
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <h2>Mobil Masuk Bulanan:</h2>
        <div>
          Bulan Lalu:{" "}
          <span className="font-semibold">
            {addedLastMonth.toLocaleString("id-ID")}
          </span>
        </div>
        <div>
          Bulan Ini:{" "}
          <span className="font-semibold">
            {addedThisMonth.toLocaleString("id-ID")}
          </span>
          {addedTrend.show && (
            <span className="ml-1">
              {renderTrend(addedTrend.value, addedTrend.direction)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
