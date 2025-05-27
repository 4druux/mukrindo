// components/skeleton/skeleton-admin/SkeletonRequest.jsx
import React from "react";

const SkeletonRequest = ({ requestType }) => {
  const SkeletonCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-5 bg-gray-200 rounded w-1/2"></div>
        <div className="h-5 bg-gray-200 rounded-full w-16"></div>
      </div>
      <div className="grid grid-cols-2 gap-3 py-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="flex flex-col space-y-1.5 min-w-0 flex-grow">
              <div className="h-2.5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );

  const SkeletonTableRow = ({ isEven }) => (
    <tr className={`${isEven ? "bg-gray-50" : "bg-white"} animate-pulse`}>
      <td className="pl-3 pr-8 py-4">
        <div className="h-4 bg-gray-200 rounded"></div>
      </td>
      <td className="pl-3 pr-8 py-4">
        <div className="h-4 bg-gray-200 rounded"></div>
      </td>
      <td className="pl-3 pr-8 py-4">
        <div className="h-4 bg-gray-200 rounded"></div>
      </td>
      <td className="pl-3 pr-10 py-4">
        <div className="h-4 bg-gray-200 rounded"></div>
      </td>
      <td className="px-3 py-4">
        <div className="h-4 bg-gray-200 rounded"></div>
      </td>
      <td className="px-3 py-4">
        <div className="h-4 bg-gray-200 rounded"></div>
      </td>
      <td className="px-3 py-4">
        <div className="h-4 bg-gray-200 rounded"></div>
      </td>
      <td className="px-3 py-4">
        <div className="h-5 bg-gray-200 rounded-full"></div>
      </td>
      <td className="px-3 py-4">
        <div className="w-6 h-6 bg-gray-200 rounded-full ml-4"></div>
      </td>
    </tr>
  );

  return (
    <>
      <div className="space-y-4 lg:hidden px-2">
        {[...Array(3)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>

      {/* Desktop Skeleton */}
      <div className="hidden lg:block rounded-xl lg:bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nama Pelanggan
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                No. Telepon
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {requestType === "buySell" ? "Mobil Dijual" : "Mobil Lama"}
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {requestType === "buySell"
                  ? "Harga Penawaran"
                  : "Preferensi Mobil"}
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left w-32 text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Lokasi
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tanggal
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left w-32 text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Jam
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Hubungi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[...Array(7)].map((_, index) => (
              <SkeletonTableRow key={index} isEven={index % 2 !== 0} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SkeletonRequest;
