// src/components/global/BookmarkRightbar.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/context/ProductContext";
import { useHeader } from "@/context/HeaderContext";
import generateSlug from "@/utils/generateSlug";

// Import Icons
import { X, Heart } from "lucide-react";
import { FaRoad, FaRegCalendarAlt, FaBoxOpen } from "react-icons/fa";
import { GiGearStickPattern } from "react-icons/gi";

const BookmarkRightbar = () => {
  const { bookmarks, products, toggleBookmark, loading } = useProducts();
  const { toggleBookmarkSidebar, isBookmarkSidebarOpen } = useHeader();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 760);
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
      transition: {
        type: "tween",
        duration: 0.5,
        ease: "easeInOut",
      },
    },
    exit: {
      ...(isMobile ? { y: "100%" } : { x: "100%" }),
      transition: {
        type: "tween",
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  // Filter produk yang ada di daftar bookmark
  const bookmarkedProducts = products.filter((product) =>
    bookmarks.has(product._id)
  );

  return (
    <AnimatePresence>
      {isBookmarkSidebarOpen && (
        <>
          {/* Overlay */}
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

          {/* Sidebar */}
          <motion.div
            key="sidebar"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed ${
              isMobile
                ? "bottom-0 left-0 w-full h-full"
                : "top-0 right-0 h-full max-w-xl lg:rounded-l-2xl"
            } bg-white shadow-xl z-50 flex flex-col pb-4`}
          >
            {/* Header Sidebar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-normal text-gray-800">
                Daftar Simpan
              </h2>
              <button
                onClick={toggleBookmarkSidebar}
                className=" p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                aria-label="Tutup daftar simpan"
              >
                <X className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
              </button>
            </div>

            {/* Body Sidebar (Scrollable) */}
            <div className="flex-grow overflow-y-auto">
              {loading && bookmarkedProducts.length === 0 ? (
                <div className="flex items-center justify-center h-[80vh] text-gray-600 px-30">
                  Memuat...
                </div>
              ) : bookmarkedProducts.length === 0 ? (
                <div className="flex items-center gap-4 justify-center h-[80vh] text-gray-600 px-10.5">
                  <FaBoxOpen className="w-24 h-24 sm:w-26 sm:h-26 text-gray-500" />
                  <div className="flex flex-col text-gray-600 mt-4 sm:mt-0">
                    <p className="text-2xl font-semibold">Oops!</p>
                    Belum ada mobil yang disimpan.
                  </div>
                </div>
              ) : (
                <ul className="divide-y w-full divide-gray-200">
                  {bookmarkedProducts.map((product) => {
                    const detailUrl = `/beli-mobil/${generateSlug(
                      product.carName,
                      product._id
                    )}`;
                    return (
                      <li
                        key={product._id}
                        className="flex py-6 px-4 lg:p-6 gap-4"
                      >
                        {/* Gambar */}
                        <div className="w-36 h-24 relative rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={product.images[0] || "/placeholder.png"}
                            alt={product.carName}
                            layout="fill"
                            objectFit="cover"
                            className="bg-gray-200"
                          />
                        </div>

                        {/* Detail */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-grow min-w-0">
                              <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
                                {product.carName}
                              </h3>

                              {/* Detail Ikon */}
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

                            {/* Bookmark */}
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
                              className="bg-orange-500 hover:bg-orange-600 transition duration-300 ease-in-out text-white text-center text-xs font-medium px-2 py-1 lg:px-3 lg:py-2 rounded-full flex-shrink-0" /* flex-shrink-0 */
                            >
                              Cek Sekarang
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
