// layout/user/product/CarDetails.jsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useProducts } from "@/context/ProductContext"; // Sesuaikan path jika perlu
import { useRouter } from "next/navigation"; // Gunakan useRouter untuk navigasi
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  Gauge,
  Gem,
  Palette,
  Settings,
  Fuel,
  GitBranch,
  Tag,
  CheckCircle,
  XCircle,
} from "lucide-react";
import ImageCarDetails from "@/components/product-user/ImageCarDetails";
import CarImageModal from "@/components/product-admin/CarImageModal";

// Komponen untuk menampilkan detail spesifikasi dengan ikon (bisa dipisah jika ingin reusable)
const SpecItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start py-3 px-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <Icon className="w-6 h-6 text-orange-500 mr-3 mt-1 flex-shrink-0" />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-md font-medium text-gray-800">{value || "-"}</p>
    </div>
  </div>
);

const CarDetails = ({ productId }) => {
  const router = useRouter();
  const { fetchProductById, incrementProductView } = useProducts();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalActiveIndex, setModalActiveIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchProductById(productId);
        if (result.success) {
          setProduct(result.data);
        } else {
          setError(result.error);
        }
      } catch (error) {
        setError(error.message || "Gagal memuat data produk.");
      } finally {
        setLoading(false);
      }
    };

    const incrementView = () => {
      console.log(
        `[EFFECT CarDetails] Incrementing view for product ID: ${productId}`
      );
      incrementProductView(productId).catch((err) => {
        console.warn("Gagal mencatat view:", err);
      });
    };

    if (productId) {
      fetchProduct();
      incrementView();
    }
  }, [productId, fetchProductById, incrementProductView]);

  const openModal = (index) => {
    setModalActiveIndex(index);
    setShowModal(true);
  };

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const closeModal = () => {
    setShowModal(false);
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
        <p className="ml-4 text-md text-gray-600">Memuat Detail Mobil...</p>
      </div>
    );
  }

  // Tampilan Error
  if (error || !product) {
    return (
      <div className="p-6 md:p-10 text-center text-red-600 min-h-[60vh] bg-gray-50 flex flex-col justify-center items-center">
        <p className="text-xl mb-4">
          {error || "Produk tidak ditemukan atau gagal dimuat."}
        </p>
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-orange-600 mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali
        </button>
        <Link href="/" className="text-blue-500 hover:underline text-sm">
          Kembali ke Halaman Utama
        </Link>
      </div>
    );
  }

  // Tampilan Detail Produk
  const {
    carName,
    brand,
    model,
    variant,
    type,
    carColor,
    cc,
    travelDistance,
    driveSystem,
    transmission,
    fuelType,
    stnkExpiry,
    plateNumber,
    yearOfAssembly,
    price,
    images,
    status,
  } = product;

  const formattedPrice = price
    ? `Rp ${price.toLocaleString("id-ID")}`
    : "Harga tidak tersedia";
  const formattedMileage = travelDistance
    ? `${travelDistance.toLocaleString("id-ID")} KM`
    : "-";
  const formattedSTNK = stnkExpiry
    ? new Date(stnkExpiry).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  return (
    <div className="">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-orange-600 mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Kembali
      </button>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="lg:w-3/5">
          <ImageCarDetails
            images={product.images}
            carName={product.carName}
            isMobile={isMobile}
            onImageClick={openModal}
          />
        </div>

        {/* Kolom Detail */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {carName}
            </h1>
            <p className="text-sm text-gray-500 mb-4">
              {brand} / {model} {variant ? `/ ${variant}` : ""}
            </p>

            <p className="text-3xl font-semibold text-orange-600 mb-5">
              {formattedPrice}
            </p>

            {/* Status Ketersediaan */}
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-6 ${
                status === "Terjual"
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800 "
              }`}
            >
              {status === "Terjual" ? (
                <XCircle className="w-4 h-4 mr-1.5" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-1.5" />
              )}
              {status || "Tersedia"}{" "}
              {/* Default ke Tersedia jika status null/undefined */}
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Spesifikasi Utama
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <SpecItem
                icon={Gauge}
                label="Jarak Tempuh"
                value={formattedMileage}
              />
              <SpecItem
                icon={Settings}
                label="Transmisi"
                value={transmission}
              />
              <SpecItem icon={Fuel} label="Bahan Bakar" value={fuelType} />
              <SpecItem
                icon={CalendarDays}
                label="Tahun Rakit"
                value={yearOfAssembly}
              />
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Detail Lainnya
            </h2>
            <div className="space-y-3 text-sm">
              <SpecItem icon={Car} label="Tipe Bodi" value={type} />
              <SpecItem icon={Palette} label="Warna" value={carColor} />
              <SpecItem
                icon={Gem}
                label="Kapasitas Mesin"
                value={cc ? `${cc} CC` : "-"}
              />
              <SpecItem
                icon={GitBranch}
                label="Sistem Penggerak"
                value={driveSystem}
              />
              <SpecItem icon={Tag} label="Nomor Plat" value={plateNumber} />
              <SpecItem
                icon={CalendarDays}
                label="Masa Berlaku STNK"
                value={formattedSTNK}
              />
            </div>

            {/* Tombol Aksi (Contoh) */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Tertarik dengan mobil ini?
              </h3>
              <button className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition duration-200">
                Hubungi via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CarImageModal
        show={showModal}
        images={product.images}
        carName={product.carName}
        initialIndex={modalActiveIndex}
        isMobile={isMobile}
        onClose={closeModal}
      />
    </div>
  );
};

export default CarDetails;
