"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import { FreeMode, Thumbs } from "swiper/modules";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProducts } from "@/context/ProductContext";
import SkeletonCarDetails from "@/components/skeleton/SkeletonCarDetails";
import { ArrowLeft, X } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { BsFuelPumpFill } from "react-icons/bs";
import { GiGearStickPattern } from "react-icons/gi";
import { FaRegCalendarAlt, FaRoad } from "react-icons/fa";
import { MdOutlineColorLens } from "react-icons/md";
import { FileCheck } from "lucide-react";

const CarDetails = ({ productId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isExpanded, isHovered } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const { fetchProductById } = useProducts();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // State untuk modal
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalActiveIndex, setModalActiveIndex] = useState(0);

  // Fungsi untuk membuka modal
  const openModal = (index) => {
    setModalActiveIndex(index);
    setShowModal(true);
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    if (thumbsSwiper && !thumbsSwiper.destroyed) {
      thumbsSwiper.slideTo(modalActiveIndex);
    }
  }, [modalActiveIndex, thumbsSwiper]);

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
        setError(error.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, fetchProductById]);

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

  if (loading || error || !product) {
    return <SkeletonCarDetails />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Product not found.</p>
          <button
            onClick={() => router.back()}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <button
        onClick={() => router.back()}
        className="flex items-center bg-orange-400 hover:bg-orange-500 text-white py-2 px-4 rounded-full mb-4 cursor-grab"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm">Back</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="px-2 lg:p-0 lg:w-1/2">
          <div
            className={`relative h-[200px] rounded-2xl mb-4 transition-all duration-500 ease-in-out ${
              !isExpanded && !isHovered ? "lg:h-[400px]" : "lg:h-[335px]"
            }`}
          >
            {/* Swiper Utama */}
            <Swiper
              spaceBetween={isMobile ? 10 : 0}
              thumbs={{
                swiper:
                  thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
              }}
              modules={[FreeMode, Thumbs]}
              className="mySwiper2 rounded-2xl"
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            >
              {product.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div
                    className={`relative h-[200px] cursor-pointer transition-all duration-500 ease-in-out group ${
                      !isExpanded && !isHovered
                        ? "lg:h-[400px]"
                        : "lg:h-[335px]"
                    }`}
                    onClick={() => openModal(index)}
                  >
                    <Image
                      src={image}
                      alt={`${product.carName} - ${index}`}
                      layout="fill"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">
              {activeIndex + 1}/{product.images.length}
            </div>
          </div>

          {/* Swiper Thumbnail */}
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={isMobile ? 4 : 10}
            slidesPerView={isMobile ? 4 : 5}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Thumbs]}
            className="mySwiper rounded-lg"
          >
            {product.images.map((image, index) => (
              <SwiperSlide key={index}>
                <div
                  className={`relative w-auto h-[50px] lg:h-[70px] cursor-pointer group ${
                    index === activeIndex
                      ? "border-2 rounded-lg border-orange-400"
                      : ""
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.carName} - Thumbnail ${index + 1}`}
                    layout="fill"
                    className="object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Product Details*/}
        <div className="p-4 lg:p-12 rounded-t-3xl lg:rounded-3xl shadow-lg bg-white lg:w-1/2">
          <div className="flex flex-col-reverse lg:flex-row lg:justify-between mb-8 lg:pb-6 border-b border-gray-300">
            <h1 className="text-md lg:text-2xl mb-1 text-gray-700">
              Detail Spesifikasi
            </h1>
            <div className="flex flex-col lg:items-end lg:gap-1">
              <h1 className="text-xl lg:text-lg text-gray-700">
                {product.carName}
              </h1>
              <p className="text-orange-500 font-semibold text-lg mb-8 lg:mb-0">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="flex justify-between mb-8">
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
          </div>

          <div className="flex justify-between mb-8">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm lg:text-base">Merk</p>
              <span className="text-gray-900 text-sm lg:text-base font-medium">
                {product.brand}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm lg:text-base">
                Kapasitas Mesin
              </p>
              <span className="text-gray-900 text-sm lg:text-base font-medium">
                {product.cc} CC
              </span>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm lg:text-base">Model</p>
              <span className="text-gray-900 text-sm lg:text-base font-medium">
                {product.model}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm lg:text-base">
                Sistem Penggerak
              </p>
              <span className="text-gray-900 text-sm lg:text-base font-medium">
                {product.driveSystem}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm lg:text-base">Variant</p>
              <span className="text-gray-900 text-sm lg:text-base font-medium">
                {product.variant}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm lg:text-base">Plat Nomor</p>
              <span className="text-gray-900 text-sm lg:text-base font-medium">
                {product.plateNumber}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm lg:text-base">Tipe</p>
              <span className="text-gray-900 text-sm lg:text-base font-medium">
                {product.type}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm lg:text-base">
                Tahun Perakitan
              </p>
              <span className="text-gray-900 text-sm lg:text-base font-medium">
                {product.yearOfAssembly}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 lg:bg-black/80"
          onClick={closeModal}
        >
          <div
            className="relative rounded-none lg:rounded-4xl min-w-sm px-2 lg:max-w-4xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-3 top-1 lg:right-5 lg:top-4 bg-white hover:bg-orange-100 rounded-full p-2 z-10 cursor-pointer group"
              onClick={closeModal}
            >
              <X className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 group-hover:text-orange-600" />
            </button>

            <Swiper
              initialSlide={modalActiveIndex}
              spaceBetween={isMobile ? 10 : 0}
              navigation
              modules={[FreeMode, Thumbs]}
              thumbs={{
                swiper:
                  thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
              }}
              className="mySwiper2 rounded-none lg:rounded-4xl"
              onSlideChange={(swiper) =>
                setModalActiveIndex(swiper.activeIndex)
              }
            >
              {product.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full h-[300px] md:h-[500px] lg:h-[550px]">
                    <Image
                      src={image}
                      alt={`${product.carName} - ${index}`}
                      layout="fill"
                      className="object-cover cursor-grab"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="absolute bottom-20 right-3 lg:bottom-24 lg:right-6 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
              {modalActiveIndex + 1}/{product.images.length}
            </div>

            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={isMobile ? 4 : 10}
              slidesPerView={isMobile ? 4 : 5}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Thumbs]}
              className="mySwiper rounded-md mt-4"
            >
              {product.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div
                    className={`relative w-full h-[50px] md:h-[70px] cursor-pointer ${
                      modalActiveIndex === index
                        ? "border-2 border-orange-500 rounded-md"
                        : ""
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index}`}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarDetails;
