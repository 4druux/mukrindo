// src/components/InfoCards.jsx
"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdGroup,
} from "react-icons/md";
import { FaBoxOpen, FaCar } from "react-icons/fa";
import { useProducts } from "@/context/ProductContext";

export const InfoCards = () => {
  const { products, loading, error } = useProducts();

  // previousCounts sekarang akan menyimpan nilai saat data pertama kali valid
  const [previousCounts, setPreviousCounts] = useState({
    available: null,
    sold: null,
  });

  const [currentStats, setCurrentStats] = useState({
    available: { count: 0, trend: 0, direction: "neutral" },
    sold: { count: 0, trend: 0, direction: "neutral" },
  });

  // Hitung jumlah saat ini, tetap sama
  const { availableCount, soldCount } = useMemo(() => {
    if (loading || !products || products.length === 0) {
      // Ditambahkan !loading untuk memastikan products sudah ada
      return { availableCount: 0, soldCount: 0 };
    }
    const available = products.filter(
      (p) => p.status?.toLowerCase() === "tersedia"
    ).length;
    const sold = products.filter(
      (p) => p.status?.toLowerCase() === "terjual"
    ).length;
    return { availableCount: available, soldCount: sold };
  }, [products, loading]); // Tambahkan loading sebagai dependensi

  useEffect(() => {
    // Hanya proses jika tidak loading dan ada produk
    if (!loading && products && products.length > 0) {
      // 1. Set previousCounts jika belum di-set (data pertama kali valid)
      if (previousCounts.available === null && previousCounts.sold === null) {
        setPreviousCounts({
          available: availableCount,
          sold: soldCount,
        });
        // Setelah previousCounts di-set, kita tidak perlu langsung menghitung tren di render ini,
        // biarkan render berikutnya dengan previousCounts yang sudah valid menghitungnya.
        // Atau, kita bisa langsung hitung tren dengan asumsi perubahan dari 0 jika ini adalah data pertama.
        // Untuk konsistensi, kita akan biarkan useEffect berikutnya yang menangani tren.
      }

      // 2. Hitung tren jika previousCounts sudah valid
      // Pastikan previousCounts sudah di-set dari blok if di atas pada render sebelumnya atau saat ini
      const prevAvailable =
        previousCounts.available !== null ? previousCounts.available : 0; // Default ke 0 jika masih null
      const prevSold = previousCounts.sold !== null ? previousCounts.sold : 0; // Default ke 0 jika masih null

      const calculateTrend = (current, previous) => {
        if (previous === 0) {
          // Jika nilai sebelumnya adalah 0
          return current > 0 ? 100 : 0; // Jika saat ini > 0, anggap naik 100%, jika tidak, 0%
        }
        if (current === previous) return 0;
        return ((current - previous) / previous) * 100;
      };

      // Hanya hitung tren jika previousCounts sudah diinisialisasi (bukan null lagi)
      // Ini mencegah tren dihitung dengan previousCounts yang masih null dari state awal.
      let newAvailableTrend = 0;
      let newSoldTrend = 0;

      if (previousCounts.available !== null) {
        // Pastikan previousCounts sudah di-set
        newAvailableTrend = calculateTrend(availableCount, prevAvailable);
      }
      if (previousCounts.sold !== null) {
        // Pastikan previousCounts sudah di-set
        newSoldTrend = calculateTrend(soldCount, prevSold);
      }

      setCurrentStats({
        available: {
          count: availableCount,
          trend: Math.abs(newAvailableTrend),
          direction:
            newAvailableTrend > 0
              ? "up"
              : newAvailableTrend < 0
              ? "down"
              : "neutral",
        },
        sold: {
          count: soldCount,
          trend: Math.abs(newSoldTrend),
          direction:
            newSoldTrend > 0 ? "up" : newSoldTrend < 0 ? "down" : "neutral",
        },
      });
    } else if (!loading && (!products || products.length === 0)) {
      // Jika tidak loading tapi tidak ada produk, reset stats
      setCurrentStats({
        available: { count: 0, trend: 0, direction: "neutral" },
        sold: { count: 0, trend: 0, direction: "neutral" },
      });
      // Reset previousCounts juga jika tidak ada data, agar saat data muncul lagi, dihitung ulang
      setPreviousCounts({ available: null, sold: null });
    }
  }, [products, loading, availableCount, soldCount, previousCounts]); // previousCounts menjadi dependensi

  // ... (kode loading, error, renderTrend, dan JSX lainnya tetap sama) ...

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6 animate-pulse"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="mt-5">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Gagal memuat data statistik produk.
      </div>
    );
  }

  const renderTrend = (trendValue, direction) => {
    // Jika previousCounts belum di-set, mungkin lebih baik tidak menampilkan tren sama sekali
    // atau menampilkan "N/A"
    if (
      previousCounts.available === null &&
      previousCounts.sold === null &&
      direction === "neutral" &&
      trendValue === 0
    ) {
      // Ini kondisi awal sebelum previousCounts di-set, atau jika memang tidak ada perubahan dari 0
      // Anda bisa memilih untuk tidak menampilkan badge tren sama sekali di sini
      // return null;
      // Atau tampilkan sebagai 0% netral
    }

    if (direction === "neutral" && trendValue === 0) {
      // Hanya tampilkan 0% jika memang netral dan 0
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {/* Bisa tambahkan ikon netral jika mau, atau biarkan kosong */}
          0.00%
        </span>
      );
    }
    if (
      direction === "neutral" &&
      trendValue === 100 &&
      (currentStats.available.count > 0 || currentStats.sold.count > 0)
    ) {
      // Ini kasus khusus dimana previous adalah 0 dan current > 0
      // Kita bisa anggap ini sebagai "Baru" atau tetap 100% naik
    }

    const isUp = direction === "up";
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isUp ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        }`}
      >
        {isUp ? (
          <MdKeyboardArrowUp className="w-4 h-4" />
        ) : (
          <MdKeyboardArrowDown className="w-4 h-4" />
        )}
        {trendValue.toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {/* Pendaftar Akun (Statis) */}
      <div className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl">
          <MdGroup className="text-gray-600 w-8 h-8" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500">Pendaftar Akun</span>
            <h4 className="text-lg font-semibold text-gray-700">3,782</h4>
          </div>
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-600">
            <MdKeyboardArrowUp className="w-4 h-4" />
            11.01%
          </span>
        </div>
      </div>

      {/* Mobil Tersedia (Dinamis) */}
      <div className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl">
          <FaCar className="text-gray-600 w-8 h-8" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500">Mobil Tersedia</span>
            <h4 className="text-lg font-semibold text-gray-700">
              {currentStats.available.count.toLocaleString("id-ID")}
            </h4>
          </div>
          {/* Hanya tampilkan tren jika previousCounts sudah diinisialisasi */}
          {previousCounts.available !== null &&
            renderTrend(
              currentStats.available.trend,
              currentStats.available.direction
            )}
        </div>
      </div>

      {/* Produk Terjual (Dinamis) */}
      <div className="bg-white border border-gray-200 md:border-none md:rounded-2xl md:shadow-md p-5 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl">
          <FaBoxOpen className="text-gray-600 w-8 h-8" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500">Produk Terjual</span>
            <h4 className="text-lg font-semibold text-gray-700">
              {currentStats.sold.count.toLocaleString("id-ID")}
            </h4>
          </div>
          {/* Hanya tampilkan tren jika previousCounts sudah diinisialisasi */}
          {previousCounts.sold !== null &&
            renderTrend(currentStats.sold.trend, currentStats.sold.direction)}
        </div>
      </div>
    </div>
  );
};
