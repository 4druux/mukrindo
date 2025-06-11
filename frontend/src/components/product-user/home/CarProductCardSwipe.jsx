// src/components/global/CarProductCardSwipe.jsx
import React from "react";
import Link from "next/link";
import generateSlug from "@/utils/generateSlug";
import { motion } from "framer-motion";

// Import Components
import { useProducts } from "@/context/ProductContext";
import CarImageCard from "@/components/global/CarImageCard";
import SkeletonAllProductUser from "@/components/skeleton/skeleton-user/SkeletonAllProduct";

// Import Icons
import { BsFuelPumpFill } from "react-icons/bs";
import { FaRegCalendarAlt, FaRoad } from "react-icons/fa";
import { GiGearStickPattern } from "react-icons/gi";
import { Heart } from "lucide-react";

const CarProductCardSwipe = ({
  products,
  loading,
  error,
  skeletonCount = 6,
  emptyMessage = "Tidak ada produk mobil yang ditemukan.",
  onProductClick = () => {},
  isRecommendation = false,
}) => {
  if (error) {
    console.error("Error loading products:", error);
  }

  const { isBookmarked, toggleBookmark } = useProducts();

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

  const cardVariants = {
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
      className={`flex space-x-4 overflow-x-auto md:grid md:gap-4 md:space-x-0 md:pb-6 px-3 md:px-2 ${
        isRecommendation
          ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-2"
          : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-4"
      }`}
      style={{ scrollbarWidth: "none" }}
    >
      {loading
        ? Array(skeletonCount)
            .fill(null)
            .map((_, index) => (
              <div
                key={index}
                className="w-72 md:w-auto flex-shrink-0 md:flex-shrink"
              >
                <SkeletonAllProductUser />
              </div>
            ))
        : products.map((product) => {
            const liked = isBookmarked(product._id);

            return (
              <motion.div
                key={product._id}
                variants={cardVariants}
                whileHover={{
                  scale: 1.01,
                  y: -3,
                  x: -2,
                  transition: { type: "spring", stiffness: 300 },
                }}
                className="w-72 md:w-auto flex-shrink-0 md:flex-shrink rounded-2xl bg-white overflow-hidden transition-shadow duration-200 relative shadow-md lg:hover:shadow-xl flex flex-col"
                onClick={() => onProductClick(product)}
              >
                <Link
                  href={`/beli-mobil/${generateSlug(
                    product.carName,
                    product._id
                  )}`}
                  className="flex-grow"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <CarImageCard
                      images={product.images}
                      altText={product.carName}
                      status={product.status}
                      brand={product.brand}
                      model={product.model}
                      variant={product.variant}
                    />
                    <div className="p-6">
                      <div className="flex flex-col border-b border-gray-300 pb-2">
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

                      {/* Detail Icons */}
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

                {/* Bookmark Button */}
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
                      e.preventDefault();
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
                    <span
                      className="absolute left-3 -translate-x-1/2 top-full mt-2
                     whitespace-nowrap rounded-lg bg-black/50 px-2 py-1 text-xs text-white
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300
                     invisible group-hover:visible
                     pointer-events-none z-20"
                    >
                      Bookmark
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}

      {/* Empty Message */}
      {!loading && products.length === 0 && (
        <div className="col-span-full text-center text-gray-500 mt-4 w-full">
          {emptyMessage}
        </div>
      )}
    </motion.div>
  );
};

export default CarProductCardSwipe;
