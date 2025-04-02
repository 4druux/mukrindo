// layout/user/product/CarDetails.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useProducts } from "@/context/ProductContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BsFuelPumpFill } from "react-icons/bs";
import { GiGearStickPattern } from "react-icons/gi";
import { FaChevronRight, FaRegCalendarAlt, FaRoad } from "react-icons/fa";
import { MdOutlineColorLens } from "react-icons/md";
import { CheckCircle, FileCheck, XCircle } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import ImageCarDetails from "@/components/product-user/ImageCarDetails";
import CarImageModal from "@/components/product-admin/CarImageModal";

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
      <div className="flex items-center justify-center h-[80vh] bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  // Tampilan Error
  if (error || !product) {
    return (
      <div className="p-6 md:p-10 text-center text-red-600 h-[80vh] bg-gray-50 flex flex-col justify-center items-center">
        <p className="text-xl mb-4">
          {error || "Produk tidak ditemukan atau gagal dimuat."}
        </p>
        <button
          onClick={() => router.back("/")}
          className="flex items-center bg-orange-400 hover:bg-orange-500 text-white py-2 px-4 rounded-full mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-sm">Kembali</span>
        </button>
      </div>
    );
  }

  const createSlug = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  };

  const brandSlug = createSlug(product.brand);
  const modelSlug = createSlug(product.model); 

  return (
    <div className="">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-600 hidden lg:block">
        <ol className="flex items-center space-x-1.5">
          <li>
            <Link href="/" className="hover:text-orange-600 hover:underline">
              Beranda
            </Link>
          </li>
          <li>
            <FaChevronRight className="w-3 h-3 text-gray-400" />
          </li>
          <li>
            <Link
              href="/beli"
              className="hover:text-orange-600 hover:underline"
            >
              Beli Mobil Bekas
            </Link>
          </li>
          <li>
            <FaChevronRight className="w-3 h-3 text-gray-400" />
          </li>
          <li>
            <Link
              href={`/beli/${brandSlug}`}
              className="hover:text-orange-600 hover:underline"
            >
              {product.brand}
            </Link>
          </li>
          <li>
            <FaChevronRight className="w-3 h-3 text-gray-400" />
          </li>
          <li>
            <Link
              href={`/beli/${brandSlug}/${modelSlug}`}
              className="hover:text-orange-600 hover:underline"
            >
              {product.model}
            </Link>
          </li>
          <li>
            <FaChevronRight className="w-3 h-3 text-gray-400" />
          </li>
          <li className="truncate">
            <span className="font-medium text-gray-800" aria-current="page">
              {`Jual Mobil ${product.carName}`}
            </span>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="lg:w-2/3">
          <ImageCarDetails
            images={product.images}
            carName={product.carName}
            isMobile={isMobile}
            onImageClick={openModal}
          />

          {/* Product Details*/}
          <div className="p-4 lg:p-8 mt-8 rounded-3xl border-t border-b border-gray-300 lg:border-none shadow-lg bg-white">
            <div className="flex flex-col mb-4 lg:mb-8 border-b border-gray-300">
              {/* <div className="flex flex-col items-start space-y-2">
                <div className="flex justify-between items-start w-full">
                  <div className="block lg:hidden">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center space-x-2">
                      <h1 className="text-xl text-gray-700">
                        {product.carName}
                      </h1>
                      <span className="text-gray-400 hidden lg:block">-</span>
                      <p className="text-sm text-gray-500">
                        {product.brand} / {product.model}{" "}
                        {product.variant ? `/ ${product.variant}` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-orange-500 font-semibold text-xl mb-2">
                  Rp {product.price.toLocaleString("id-ID")}
                </p>
              </div> */}

              <div className="flex justify-between mb-3">
                <h1 className="text-md mt-1 text-gray-700">
                  Spesifikasi Utama
                </h1>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs lg:text-sm font-medium  ${
                    product.status === "Terjual"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {product.status === "Terjual" ? (
                    <XCircle className="w-4 h-4 mr-1 lg:mr-1.5" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-1 lg:mr-1.5" />
                  )}
                  {product.status}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-14 gap-y-6 lg:flex lg:justify-between lg:gap-x-6 mb-4 lg:mb-8 border-b lg:border-none border-gray-300">
              <div className="flex items-center space-x-2">
                <FaRoad className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                <div className="flex flex-col">
                  <p className="text-xs text-gray-700">Kilometer</p>
                  <span className="text-gray-900 font-medium text-sm">
                    {product.travelDistance.toLocaleString("id-ID")} KM
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <GiGearStickPattern className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                <div className="flex flex-col">
                  <p className="text-xs text-gray-700">Transmisi</p>
                  <span className="text-gray-900 font-medium text-sm">
                    {product.transmission}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <BsFuelPumpFill className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                <div className="flex flex-col">
                  <p className="text-xs text-gray-700">Bahan Bakar</p>
                  <span className="text-gray-900 font-medium text-sm">
                    {product.fuelType}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <MdOutlineColorLens className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                <div className="flex flex-col">
                  <p className="text-xs text-gray-700">Warna</p>
                  <span className="text-gray-900 font-medium text-sm">
                    {product.carColor}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <FileCheck className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                <div className="flex flex-col">
                  <p className="text-xs text-gray-700">Masa Berlaku STNK</p>
                  <span className="text-gray-900 font-medium text-sm">
                    {product.stnkExpiry}
                  </span>
                </div>
              </div>

              <div className="block lg:hidden">
                <div className="flex items-center space-x-2">
                  <FaRegCalendarAlt className="text-gray-600 w-5 h-5 lg:w-8 lg:h-8" />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-700">Plat Nomor</p>
                    <span className="text-gray-900 font-medium text-sm">
                      {product.plateNumber}
                    </span>
                  </div>
                </div>
              </div>

              <h1 className="block lg:hidden text-md text-gray-700 mb-3">
                Detail Spesifikasi
              </h1>
            </div>

            <div className="flex flex-col lg:flex-row justify-between gap-4">
              <div className="flex flex-col flex-2 gap-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-sm">Merk</p>
                  <span className="text-gray-900 text-sm font-medium">
                    {product.brand}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-sm">Model</p>
                  <span className="text-gray-900 text-sm font-medium">
                    {product.model}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-sm">Variant</p>
                  <span className="text-gray-900 text-sm font-medium">
                    {product.variant}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-sm">Kapasitas Mesin</p>
                  <span className="text-gray-900 text-sm font-medium">
                    {product.cc} CC
                  </span>
                </div>
              </div>

              <div className="flex flex-col flex-2 gap-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-sm">Sistem Penggerak</p>
                  <span className="text-gray-900 text-sm font-medium">
                    {product.driveSystem}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-sm">Tipe</p>
                  <span className="text-gray-900 text-sm font-medium">
                    {product.type}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-sm">Plat Nomor</p>
                  <span className="text-gray-900 text-sm font-medium">
                    {product.plateNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-sm">Tahun Perakitan</p>
                  <span className="text-gray-900 text-sm font-medium">
                    {product.yearOfAssembly}
                  </span>
                </div>
              </div>
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
