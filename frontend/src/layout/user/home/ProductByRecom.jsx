// layout/user/product/ProductByRecom.jsx
"use client";
import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { useProducts } from "@/context/ProductContext";
import CarProductCardSwipe from "@/components/product-user/home/CarProductCardSwipe";
import TittleText from "@/components/common/TittleText";
import { motion, useInView, AnimatePresence } from "framer-motion";

const VIEWED_PRODUCTS_KEY = "viewedCarProducts";
const MAX_VIEWED_ITEMS = 10;

const getRecentlyViewed = () => {
  if (typeof window === "undefined") return [];
  const items = localStorage.getItem(VIEWED_PRODUCTS_KEY);
  return items ? JSON.parse(items) : [];
};

const FILTER_TYPES = {
  RECOMMENDATION: "recommendation",
  LATEST: "latest",
  PRICE_ASC: "price_asc",
  YEAR_DESC: "year_desc",
};

const ProductByRecom = () => {
  const { products, loading, error } = useProducts();
  const [activeFilter, setActiveFilter] = useState(FILTER_TYPES.RECOMMENDATION);
  const [recentlyViewed, setRecentlyViewed] = useState(getRecentlyViewed);
  const buttonRefs = useRef({});
  const scrollContainerRef = useRef(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    const scrollToActiveButton = () => {
      if (activeFilter && buttonRefs.current[activeFilter]) {
        const activeButton = buttonRefs.current[activeFilter];
        activeButton.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    };

    scrollToActiveButton();
  }, [activeFilter]);

  const addRecentlyViewed = (product) => {
    if (typeof window === "undefined" || !product) return;
    const currentViewed = getRecentlyViewed();
    const newItem = {
      id: product._id,
      brand: product.brand,
      model: product.model,
      variant: product.variant,
    };
    const filteredViewed = currentViewed.filter(
      (item) => item.id !== newItem.id
    );
    const updatedViewed = [newItem, ...filteredViewed].slice(
      0,
      MAX_VIEWED_ITEMS
    );
    localStorage.setItem(VIEWED_PRODUCTS_KEY, JSON.stringify(updatedViewed));
    setRecentlyViewed(updatedViewed);
  };

  const displayedProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }
    let sortedProducts = [...products];
    switch (activeFilter) {
      case FILTER_TYPES.LATEST:
        sortedProducts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case FILTER_TYPES.PRICE_ASC:
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case FILTER_TYPES.YEAR_DESC:
        sortedProducts.sort((a, b) => b.yearOfAssembly - a.yearOfAssembly);
        break;
      case FILTER_TYPES.RECOMMENDATION:
        if (recentlyViewed && recentlyViewed.length > 0) {
          const viewedBrands = new Set(
            recentlyViewed.map((item) => item.brand?.toLowerCase())
          );
          const viewedModels = new Set(
            recentlyViewed.map(
              (item) =>
                `${item.brand?.toLowerCase()}-${item.model?.toLowerCase()}`
            )
          );
          sortedProducts.sort((a, b) => {
            let scoreA = 0,
              scoreB = 0;
            const modelA = `${a.brand?.toLowerCase()}-${a.model?.toLowerCase()}`;
            const modelB = `${b.brand?.toLowerCase()}-${b.model?.toLowerCase()}`;
            if (viewedModels.has(modelA)) scoreA = 2;
            else if (viewedBrands.has(a.brand?.toLowerCase())) scoreA = 1;
            if (viewedModels.has(modelB)) scoreB = 2;
            else if (viewedBrands.has(b.brand?.toLowerCase())) scoreB = 1;
            if (scoreB !== scoreA) return scoreB - scoreA;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
        } else {
          const productsByCluster = new Map();
          sortedProducts.forEach((product) => {
            if (product.clusterId != null) {
              if (!productsByCluster.has(product.clusterId)) {
                productsByCluster.set(product.clusterId, []);
              }
              productsByCluster.get(product.clusterId).push(product);
            }
          });
          if (productsByCluster.size > 0) {
            const productsWithoutCluster = sortedProducts.filter(
              (p) => p.clusterId == null
            );
            const sortedClusters = [...productsByCluster.entries()].sort(
              (a, b) => b[1].length - a[1].length
            );
            sortedProducts = sortedClusters
              .flatMap((c) => c[1])
              .concat(productsWithoutCluster);
          } else {
            sortedProducts.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
          }
        }
        break;
      default:
        sortedProducts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
    return sortedProducts;
  }, [products, activeFilter, recentlyViewed]);

  const handleProductClick = (product) => {
    addRecentlyViewed(product);
  };

  if (error) {
    return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
  }

  const emptyMessage = `Tidak ada produk mobil yang ditemukan ${
    activeFilter !== FILTER_TYPES.LATEST ? `untuk filter ini` : ""
  }.`;

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: i * 0.1 },
    }),
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <motion.div
        variants={itemVariants}
        className="flex justify-between items-center mb-2 lg:mb-4 px-3 md:px-0"
      >
        <TittleText text="Mobil Pilihan Terbaik" />
        <div className="block md:hidden">
          <Link href="/beli">
            <p className="text-xs text-orange-500 font-medium hover:text-orange-600 hover:text-underline hover:underline cursor-pointer">
              Tampilkan Semua
            </p>
          </Link>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex space-x-2 overflow-x-auto px-3 md:px-0"
        style={{ scrollbarWidth: "none" }}
        ref={scrollContainerRef}
      >
        <button
          onClick={() => setActiveFilter(FILTER_TYPES.RECOMMENDATION)}
          ref={(el) => (buttonRefs.current[FILTER_TYPES.RECOMMENDATION] = el)}
          className={`px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
            activeFilter === FILTER_TYPES.RECOMMENDATION
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Rekomendasi
        </button>
        <button
          onClick={() => setActiveFilter(FILTER_TYPES.LATEST)}
          ref={(el) => (buttonRefs.current[FILTER_TYPES.LATEST] = el)}
          className={`px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
            activeFilter === FILTER_TYPES.LATEST
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Mobil Terbaru
        </button>
        <button
          onClick={() => setActiveFilter(FILTER_TYPES.PRICE_ASC)}
          ref={(el) => (buttonRefs.current[FILTER_TYPES.PRICE_ASC] = el)}
          className={`px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
            activeFilter === FILTER_TYPES.PRICE_ASC
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Harga Terendah
        </button>
        <button
          onClick={() => setActiveFilter(FILTER_TYPES.YEAR_DESC)}
          ref={(el) => (buttonRefs.current[FILTER_TYPES.YEAR_DESC] = el)}
          className={`px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
            activeFilter === FILTER_TYPES.YEAR_DESC
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Tahun Terbaru
        </button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <AnimatePresence mode="wait">
          <CarProductCardSwipe
            key={activeFilter}
            products={displayedProducts.slice(0, 8)}
            loading={loading}
            onProductClick={handleProductClick}
            emptyMessage={emptyMessage}
          />
        </AnimatePresence>
      </motion.div>

      <p className="text-xs text-center text-gray-500 block md:hidden">
        Hanya menampilkan {displayedProducts.slice(0, 8).length} dari{" "}
        {products.length} Mobil
      </p>
      <div className="hidden md:block">
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-500">
            Hanya menampilkan {displayedProducts.slice(0, 8).length} dari{" "}
            {products.length} Mobil
          </p>
          <Link href="/beli">
            <p className="text-sm text-orange-500 font-medium hover:text-orange-600 hover:text-underline hover:underline cursor-pointer">
              Tampilkan Semua Mobil
            </p>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductByRecom;
