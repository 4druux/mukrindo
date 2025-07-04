// src/components/global/CarProductCard.jsx

import React, { useState } from "react";
import Link from "next/link";
import generateSlug from "@/utils/generateSlug";
// Import AnimatePresence
import { motion, AnimatePresence } from "framer-motion";

// Import Components
import { useProducts } from "@/context/ProductContext";
import CarImageCard from "@/components/global/CarImageCard";
import SkeletonAllProductUser from "@/components/skeleton/skeleton-user/SkeletonAllProduct";
import SkeletonAllProductAdmin from "@/components/skeleton/skeleton-admin/SkeletonAllProduct";
import DotLoader from "@/components/common/DotLoader";

// Import Icons
import { BsFuelPumpFill } from "react-icons/bs";
import { FaRegCalendarAlt, FaRoad, FaEye } from "react-icons/fa";
import { GiGearStickPattern } from "react-icons/gi";
import { Ellipsis, Heart, SquarePen, Trash2 } from "lucide-react";

const dropDownVariant = {
  open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const CarProductCard = ({
  products,
  loading,
  error,
  isAdminRoute = false,
  skeletonCount = isAdminRoute ? 8 : 6,
  emptyMessage = "Tidak ada produk mobil yang ditemukan.",
  handleStatusChange = async (_productId, _newStatus) => {},
  handleDelete = () => {},
  toggleDropdown = () => {},
  isDropdownOpen = {},
  dropdownRefs = { current: {} },
}) => {
  if (error) {
    console.error("Error loading products:", error);
  }

  const { isBookmarked, toggleBookmark } = useProducts();
  const [soldProductId, setSoldProductId] = useState(null);

  const SkeletonComponent = isAdminRoute
    ? SkeletonAllProductAdmin
    : SkeletonAllProductUser;

  const gridClass = isAdminRoute
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4 px-3 md:px-0"
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 px-3 md:px-0";

  const handleSoldClick = async (productId) => {
    if (soldProductId === productId) return;

    setSoldProductId(productId);
    try {
      await handleStatusChange(productId, "Terjual");
    } catch (err) {
      console.error("Gagal menandai Terjual dari Card:", err);
    } finally {
      setSoldProductId(null);
    }
  };

  if (loading) {
    return (
      <div className={gridClass}>
        {Array(skeletonCount)
          .fill(null)
          .map((_, index) => (
            <SkeletonComponent key={`skeleton-${index}`} />
          ))}
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const cardItemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.98,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      key="product-grid"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={gridClass}
    >
      <AnimatePresence>
        {products.map((product) => {
          const detailUrl = isAdminRoute
            ? `/admin/produk/detail-mobil/${generateSlug(
                product.carName,
                product._id
              )}`
            : `/beli-mobil/${generateSlug(product.carName, product._id)}`;

          const editUrl = `/admin/produk/edit-produk/${generateSlug(
            product.carName,
            product._id
          )}`;

          const liked = isBookmarked(product._id);
          const isMarkingAsSold = soldProductId === product._id;

          return (
            <motion.div
              key={product._id}
              layout
              variants={cardItemVariants}
              whileHover={{
                scale: 1.01,
                y: -3,
                x: -2,
                transition: { type: "spring", stiffness: 300 },
              }}
              className="rounded-2xl bg-white overflow-hidden transition-shadow duration-200 relative shadow-md hover:shadow-xl flex flex-col"
            >
              <Link href={detailUrl} className="flex-grow">
                <div>
                  <CarImageCard
                    images={product.images}
                    altText={product.carName}
                    status={product.status}
                    brand={product.brand}
                    model={product.model}
                    variant={product.variant}
                    isMarkingAsSold={isMarkingAsSold}
                  />
                  <div className={`p-4 ${isAdminRoute ? "pb-2" : "p-6"}`}>
                    <div
                      className={`flex flex-col ${
                        isAdminRoute ? "" : "border-b border-gray-300 pb-2"
                      }`}
                    >
                      <h2
                        className="text-md text-gray-800 truncate"
                        title={product.carName}
                      >
                        {product.carName}
                      </h2>
                      <p className="text-orange-500 font-medium text-lg mt-2">
                        Rp {product.price.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="flex justify-between py-3 mt-2">
                      <div className="flex flex-col items-center space-y-1 text-center">
                        <FaRoad className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-600 text-xs">
                          {product.travelDistance.toLocaleString("id-ID")} KM
                        </span>
                      </div>
                      <div className="flex flex-col items-center space-y-1 text-center">
                        <GiGearStickPattern className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-600 text-xs">
                          {product.transmission}
                        </span>
                      </div>
                      <div className="flex flex-col items-center space-y-1 text-center">
                        <BsFuelPumpFill className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-600 text-xs">
                          {product.fuelType}
                        </span>
                      </div>
                      <div className="flex flex-col items-center space-y-1 text-center">
                        <FaRegCalendarAlt className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-600 text-xs">
                          {product.plateNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {!isAdminRoute && (
                <>
                  <div
                    className={`absolute top-2 right-2 z-10 ${
                      product.status === "Terjual" ? "hidden" : ""
                    }`}
                  >
                    <div
                      className="relative group cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(product._id);
                      }}
                    >
                      <div className="bg-black/30 p-2 rounded-full shadow transition">
                        <Heart
                          className={`w-4 h-4 lg:w-5 lg:h-5 ${
                            liked
                              ? "text-red-500 fill-red-500"
                              : "text-white fill-none"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {isAdminRoute && (
                <>
                  <div
                    className={`absolute top-2 right-2 z-10 ${
                      product.status === "Terjual" ? "hidden" : ""
                    }`}
                    ref={(el) => (dropdownRefs.current[product._id] = el)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(product._id);
                      }}
                      className={`p-1 rounded-full border border-gray-100 bg-gray-100 hover:bg-orange-200 hover:border-orange-500
                        cursor-pointer group ${
                          isDropdownOpen[product._id]
                            ? "bg-orange-200 border-orange-500"
                            : ""
                        }`}
                      aria-label="Ubah Status"
                    >
                      <Ellipsis
                        className={`w-4 h-4 text-gray-700 group-hover:text-orange-600 ${
                          isDropdownOpen[product._id] ? "text-orange-600" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {isDropdownOpen[product._id] && (
                        <motion.div
                          initial="closed"
                          animate="open"
                          exit="closed"
                          variants={dropDownVariant}
                          className="absolute right-0 mt-2 w-28 bg-white border border-gray-300 rounded-lg shadow-lg z-20"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSoldClick(product._id);
                            }}
                            disabled={!!soldProductId}
                            className="flex items-center justify-center w-full text-xs px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer rounded-lg"
                          >
                            {isMarkingAsSold ? (
                              <DotLoader dotSizeClassName="w-2 h-2" />
                            ) : (
                              "Tandai Terjual"
                            )}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="px-4 pb-4 pt-1 mt-auto">
                    <div className="flex justify-between items-center border-t border-gray-200">
                      <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                        <FaEye />
                        <span> {product.viewCount || 0} Dilihat</span>
                      </div>
                      <div className="flex items-center md:space-x-1 mt-2">
                        <Link
                          href={editUrl}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-full hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-300"
                          aria-label="Edit Produk"
                        >
                          <SquarePen className="w-4 h-4 text-neutral-500" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(product._id);
                          }}
                          className="p-2 rounded-full hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                          aria-label="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {!loading && products.length === 0 && (
        <div className="col-span-full text-center text-gray-500 mt-4">
          {emptyMessage}
        </div>
      )}
    </motion.div>
  );
};

export default CarProductCard;
