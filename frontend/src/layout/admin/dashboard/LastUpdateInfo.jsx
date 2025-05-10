"use client";
import React, { useState, useEffect, useRef } from "react";
import { useProducts } from "@/context/ProductContext";
import { formatDistanceToNow, differenceInSeconds } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { FiRefreshCw } from "react-icons/fi";
import isEqual from "lodash/isEqual";
import objectHash from "object-hash"; // 1. Import object-hash

const LAST_UPDATE_TIME_KEY = "productLastUpdateTime";
// 2. Ganti nama key untuk menyimpan HASH, bukan data mentah
const PREVIOUS_PRODUCTS_HASH_KEY = "previousProductsHash";

export default function LastUpdatedInfo() {
  const { products, loading, error, mutateProducts } = useProducts();
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Ref untuk menyimpan data produk aktual dari render sebelumnya (dalam sesi komponen yang sama)
  // Ini digunakan untuk perbandingan isEqual dalam sesi, yang lebih efisien daripada hashing ulang.
  const prevProductsInMemoryRef = useRef();
  // Ref untuk menandai apakah ini pemuatan data pertama kali dalam sesi komponen ini
  const isInitialComponentLoadRef = useRef(true);

  // Efek untuk memuat timestamp dari localStorage saat komponen pertama kali mount
  useEffect(() => {
    const storedTime = localStorage.getItem(LAST_UPDATE_TIME_KEY);
    if (storedTime) {
      const date = new Date(storedTime);
      if (!isNaN(date.getTime())) {
        setLastUpdateTime(date);
      } else {
        // Jika tanggal tidak valid, hapus dari localStorage
        localStorage.removeItem(LAST_UPDATE_TIME_KEY);
      }
    }
    isInitialComponentLoadRef.current = true; // Tandai ini adalah pemuatan awal komponen
  }, []); // Hanya berjalan sekali saat mount

  // Efek utama untuk memproses perubahan data produk
  useEffect(() => {
    if (loading) {
      // Jika sedang loading, jangan lakukan apa-apa sampai selesai
      return;
    }

    if (error) {
      // Jika ada error, jangan update timestamp
      return;
    }

    // 'products' dari context Anda adalah 'data || []', jadi seharusnya selalu array.
    // Kita akan menghash 'products' ini. objectHash menangani array dan objek dengan baik.
    const currentProducts = products;
    // 3. Hitung hash dari produk saat ini.
    // `|| null` untuk kasus jika `products` bisa jadi `undefined` (meskipun context Anda mencegahnya)
    const currentProductsHash = objectHash(currentProducts || null);

    let shouldUpdateTime = false;

    if (isInitialComponentLoadRef.current) {
      // Ini adalah pemuatan data pertama setelah komponen mount (misalnya, setelah refresh halaman)
      const storedPreviousProductsHash = localStorage.getItem(
        PREVIOUS_PRODUCTS_HASH_KEY
      );

      if (!storedPreviousProductsHash) {
        // Tidak ada hash sebelumnya di localStorage.
        // Jika ada produk saat ini (bahkan array kosong), anggap ini data "baru" relatif terhadap ketiadaan.
        console.log(
          "Initial load: No previous hash in localStorage. Setting timestamp."
        );
        shouldUpdateTime = true;
      } else if (currentProductsHash !== storedPreviousProductsHash) {
        // Ada hash sebelumnya, dan hash data saat ini berbeda
        console.log(
          "Initial load: Data hash changed compared to localStorage. Updating timestamp."
        );
        shouldUpdateTime = true;
      } else {
        // Hash sama dengan yang di localStorage, timestamp dari localStorage (jika ada) sudah benar.
        console.log(
          "Initial load: Data hash is the same as localStorage. Using stored timestamp."
        );
      }
      isInitialComponentLoadRef.current = false;
    } else {
      // Ini adalah pembaruan data berikutnya dalam sesi komponen yang sama (misalnya, SWR revalidate)
      // Di sini kita membandingkan objek aktual menggunakan isEqual karena lebih efisien daripada hashing ulang prevProductsInMemoryRef.current
      // SWR juga menggunakan isEqual, jadi jika 'products' berubah di sini, itu berarti kontennya berbeda.
      if (!isEqual(currentProducts, prevProductsInMemoryRef.current)) {
        console.log(
          "Subsequent update: Data changed (isEqual). Updating timestamp."
        );
        shouldUpdateTime = true;
      } else {
        console.log(
          "Subsequent update: Data is the same (isEqual). Not updating timestamp."
        );
      }
    }

    if (shouldUpdateTime) {
      const newTime = new Date();
      setLastUpdateTime(newTime);
      try {
        localStorage.setItem(LAST_UPDATE_TIME_KEY, newTime.toISOString());
        // 4. Simpan HASH baru ke localStorage, bukan seluruh data produk
        localStorage.setItem(PREVIOUS_PRODUCTS_HASH_KEY, currentProductsHash);
        console.log("Timestamp and new product hash saved to localStorage.");
      } catch (e) {
        // Error ini seharusnya tidak terjadi untuk hash karena ukurannya kecil,
        // tapi tetap tangani untuk jaga-jaga.
        console.error(
          "Failed to setItem in localStorage (timestamp or hash):",
          e
        );
        if (e.name === "QuotaExceededError") {
          console.warn(
            "QuotaExceededError while saving hash. This is unexpected. Clearing related keys."
          );
          // Jika terjadi (sangat tidak mungkin untuk hash), hapus item untuk mencegah error berulang.
          localStorage.removeItem(LAST_UPDATE_TIME_KEY);
          localStorage.removeItem(PREVIOUS_PRODUCTS_HASH_KEY);
        }
      }
    }

    // Selalu update ref memori dengan objek produk *aktual* untuk perbandingan isEqual pada render berikutnya
    prevProductsInMemoryRef.current = currentProducts;
  }, [products, loading, error]); // Dependensi utama

  const handleManualRefresh = async () => {
    setIsUpdating(true);
    // isInitialComponentLoadRef.current tidak perlu direset di sini.
    // Logika di useEffect sudah menangani perbandingan dengan benar.
    try {
      await mutateProducts(); // SWR akan fetch, dan useEffect di atas akan menangani update
    } catch (e) {
      console.error("Gagal melakukan refresh manual:", e);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderTimestamp = () => {
    if (
      loading &&
      !lastUpdateTime &&
      isInitialComponentLoadRef.current &&
      !isUpdating
    ) {
      return <span className="italic">Memuat data awal...</span>;
    }
    // Kondisi saat refresh manual dan belum ada data sama sekali (lastUpdateTime & prevProductsInMemoryRef kosong)
    if (isUpdating && !lastUpdateTime && !prevProductsInMemoryRef.current) {
      return <span className="italic">Menyegarkan data...</span>;
    }
    if (error) {
      return <span className="text-red-500 italic">Gagal memuat data.</span>;
    }
    if (!lastUpdateTime) {
      return <span className="italic">Menunggu data...</span>;
    }

    const secondsSinceUpdate = differenceInSeconds(new Date(), lastUpdateTime);
    if (secondsSinceUpdate < 60) {
      return <span className="font-semibold">baru saja</span>;
    }
    return (
      <span className="font-semibold">
        {formatDistanceToNow(lastUpdateTime, {
          addSuffix: true,
          locale: localeID,
        })}
      </span>
    );
  };

  return (
    <div className="p-4 border border-gray-200 md:border-none md:rounded-2xl md:shadow-sm text-sm text-gray-600 bg-white flex items-center justify-between">
      <div>Terakhir diperbarui: {renderTimestamp()}</div>
      <button
        onClick={handleManualRefresh}
        // Disable jika sedang update ATAU jika loading awal dan belum ada data/timestamp
        disabled={
          isUpdating ||
          (loading && !prevProductsInMemoryRef.current && !lastUpdateTime)
        }
        className="p-2 text-orange-600 bg-orange-100 rounded-md hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        aria-label={isUpdating ? "Sedang menyegarkan data" : "Segarkan data"}
      >
        <FiRefreshCw size={16} className={isUpdating ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
