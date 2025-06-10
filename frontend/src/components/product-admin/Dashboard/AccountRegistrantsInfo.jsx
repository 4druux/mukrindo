// frontend/src/components/product-admin/Dashboard/AccountRegistrantsInfo.jsx
"use client";
import React from "react";
import { MdGroup } from "react-icons/md";

export const AccountRegistrantsInfo = ({
  totalUsers,
  registeredThisMonth,
  registeredLastMonth,
  registrationTrend,
  renderTrend,
}) => {
  return (
    <div className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5">
      <h2 className="text-md text-gray-700 font-medium">Pendaftar Akun</h2>
      <div className="flex items-start justify-start gap-2 mt-2">
        <div className="flex items-center justify-center w-14 h-10 bg-blue-100 text-blue-600 rounded-lg mb-3">
          <MdGroup className="w-5 h-5" />
        </div>
        <p className="text-xl font-semibold text-blue-600 mt-2 text-center">
          {totalUsers.toLocaleString("id-ID")}
        </p>
      </div>
      <div className="text-xs text-gray-600 space-y-1">
        <h2>Pendaftar Bulanan:</h2>
        <div>
          Bulan Lalu:{" "}
          <span className="font-semibold">
            {registeredLastMonth.toLocaleString("id-ID")}
          </span>
        </div>
        <div>
          Bulan Ini:{" "}
          <span className="font-semibold">
            {registeredThisMonth.toLocaleString("id-ID")}
          </span>
          {registrationTrend.show && (
            <span className="ml-1">
              {renderTrend(
                registrationTrend.value,
                registrationTrend.direction
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
