// src/components/global/BookmarkRightbar.jsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/context/ProductContext";
import { useHeader } from "@/context/HeaderContext";
import generateSlug from "@/utils/generateSlug";
import DotLoader from "@/components/common/DotLoader";

// Import Icons
import { X, Heart } from "lucide-react";
import { FaRoad, FaRegCalendarAlt, FaBoxOpen } from "react-icons/fa";
import { GiGearStickPattern } from "react-icons/gi";
import ButtonAction from "@/components/common/ButtonAction";

const BookmarkRightbar = () => {
  const { bookmarks, products, toggleBookmark, loading } = useProducts();
  const { toggleBookmarkSidebar, isBookmarkSidebarOpen } = useHeader();
  const [isMobile, setIsMobile] = useState(false);

  const getValidImagesArray = (productImages) => {
    if (productImages && Array.isArray(productImages)) {
      return productImages.filter(
        (img) =>
          typeof img === "string" &&
          img.trim() !== "" &&
          (img.startsWith("http") || img.startsWith("/"))
      );
    }
    return [];
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

  useEffect(() => {
    document.body.style.overflow = isBookmarkSidebarOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isBookmarkSidebarOpen]);

  const sidebarVariants = {
    hidden: isMobile ? { y: "100%" } : { x: "100%" },
    visible: {
      ...(isMobile ? { y: 0 } : { x: 0 }),
      transition: { type: "tween", duration: 0.5, ease: "easeInOut" },
    },
    exit: {
      ...(isMobile ? { y: "100%" } : { x: "100%" }),
      transition: { type: "tween", duration: 0.5, ease: "easeInOut" },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } },
    exit: { opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  };

  const bookmarkedProducts = useMemo(() => {
    return products.filter((product) => bookmarks.has(product._id));
  }, [products, bookmarks]);

  return (
    <AnimatePresence>
      {isBookmarkSidebarOpen && (
        <>
          <motion.div
            key="overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={toggleBookmarkSidebar}
            className="fixed inset-0 bg-black/50 z-50"
            aria-hidden="true"
          />

          <motion.div
            key="sidebar"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed ${
              isMobile
                ? "bottom-0 left-0 w-full h-full"
                : "top-0 right-0 h-full w-[450px] lg:rounded-l-2xl"
            } bg-white shadow-xl z-50 flex flex-col pb-4`}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-md font-medium text-gray-700">
                Daftar Simpan
              </h2>
              <button
                onClick={toggleBookmarkSidebar}
                className="p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                aria-label="Tutup daftar simpan"
              >
                <X className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 p-6">
                  <DotLoader text="Memuat..." />
                </div>
              ) : bookmarkedProducts.length === 0 ? (
                <div className="flex items-center gap-4 justify-center h-full text-gray-600 p-6 text-start">
                  <FaBoxOpen className="w-24 h-24 text-gray-400" />
                  <div className="flex flex-col text-gray-600">
                    <p className="text-xl font-semibold">Oops!</p>
                    <p>Belum ada mobil yang disimpan.</p>
                  </div>
                </div>
              ) : (
                <ul className="divide-y w-full divide-gray-200">
                  {bookmarkedProducts.map((product) => {
                    const detailUrl = `/beli-mobil/${generateSlug(
                      product.carName,
                      product._id
                    )}`;

                    const validImagesForThisProduct = getValidImagesArray(
                      product.images
                    );
                    const imageUrl =
                      validImagesForThisProduct.length > 0
                        ? validImagesForThisProduct[0]
                        : "/placeholder.png";

                    return (
                      <li
                        key={product._id}
                        className="flex py-6 px-4 lg:p-6 gap-4"
                      >
                        <div className="w-36 h-24 relative rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={imageUrl}
                            alt={product.carName || "Gambar Mobil"}
                            fill
                            sizes="(max-width: 768px) 144px, 144px"
                            style={{ objectFit: "cover" }}
                            className="bg-gray-200"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.png";
                            }}
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-grow min-w-0">
                              <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
                                {product.carName}
                              </h3>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <FaRoad />
                                  {product.travelDistance.toLocaleString(
                                    "id-ID"
                                  )}{" "}
                                  KM
                                </span>
                                <span className="flex items-center gap-1">
                                  <GiGearStickPattern />
                                  {product.transmission}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FaRegCalendarAlt />
                                  {product.plateNumber}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleBookmark(product._id)}
                              className="text-red-500 p-1 hover:bg-red-50 rounded-full cursor-pointer flex-shrink-0"
                              aria-label={`Hapus ${product.carName} dari daftar simpan`}
                            >
                              <Heart size={18} fill="currentColor" />
                            </button>
                          </div>
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between mt-2 gap-1">
                            <p className="text-sm font-semibold text-orange-500">
                              Rp {product.price.toLocaleString("id-ID")}
                            </p>

                            <Link
                              href={detailUrl}
                              onClick={toggleBookmarkSidebar}
                            >
                              <ButtonAction className="w-full !text-xs !font-medium !px-2 !py-1 lg:!px-3 lg:!py-2 !rounded-full !flex-shrink-0">
                                Cek Sekarang
                              </ButtonAction>
                            </Link>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BookmarkRightbar;
