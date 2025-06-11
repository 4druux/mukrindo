// layout/user/product/ProductByPrice.jsx
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

const addRecentlyViewed = (product) => {
  if (typeof window === "undefined" || !product) return;
  const viewed = getRecentlyViewed();
  const newItem = {
    id: product._id,
    brand: product.brand,
    model: product.model,
    variant: product.variant,
  };
  const filteredViewed = viewed.filter((item) => item.id !== newItem.id);
  const updatedViewed = [newItem, ...filteredViewed].slice(0, MAX_VIEWED_ITEMS);
  localStorage.setItem(VIEWED_PRODUCTS_KEY, JSON.stringify(updatedViewed));
};

const PRICE_FILTER_TYPES = {
  ALL: "all",
  UNDER_150: "under_150",
  BETWEEN_150_300: "between_150_300",
  OVER_300: "over_300",
};

// Batas Harga (dalam angka)
const PRICE_LOWER_BOUND = 150000000;
const PRICE_UPPER_BOUND = 300000000;

const ProductByPrice = () => {
  const { products, loading, error } = useProducts();
  const [activeFilter, setActiveFilter] = useState(PRICE_FILTER_TYPES.ALL);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
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

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  const displayedProducts = useMemo(() => {
    if (loading || !products || products.length === 0) {
      return [];
    }

    let filteredProducts = products;

    switch (activeFilter) {
      case PRICE_FILTER_TYPES.UNDER_150:
        filteredProducts = products.filter((p) => p.price < PRICE_LOWER_BOUND);
        break;
      case PRICE_FILTER_TYPES.BETWEEN_150_300:
        filteredProducts = products.filter(
          (p) => p.price >= PRICE_LOWER_BOUND && p.price <= PRICE_UPPER_BOUND
        );
        break;
      case PRICE_FILTER_TYPES.OVER_300:
        filteredProducts = products.filter((p) => p.price > PRICE_UPPER_BOUND);
        break;
      case PRICE_FILTER_TYPES.ALL:
      default:
        filteredProducts = products;
        break;
    }

    return filteredProducts;
  }, [products, activeFilter, loading]);

  const handleProductClick = (product) => {
    addRecentlyViewed(product);
  };

  if (error) {
    return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
  }

  const emptyMessage = `Tidak ada produk mobil yang ditemukan ${
    activeFilter !== PRICE_FILTER_TYPES.ALL ? `untuk rentang harga ini` : ""
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
        <TittleText text="Mobil Sesuai Budget" />
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
          onClick={() => setActiveFilter(PRICE_FILTER_TYPES.ALL)}
          ref={(el) => (buttonRefs.current[PRICE_FILTER_TYPES.ALL] = el)}
          className={`px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
            activeFilter === PRICE_FILTER_TYPES.ALL
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Semua Harga
        </button>
        <button
          onClick={() => setActiveFilter(PRICE_FILTER_TYPES.UNDER_150)}
          ref={(el) => (buttonRefs.current[PRICE_FILTER_TYPES.UNDER_150] = el)}
          className={`px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
            activeFilter === PRICE_FILTER_TYPES.UNDER_150
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Dibawah 150 Juta
        </button>
        <button
          onClick={() => setActiveFilter(PRICE_FILTER_TYPES.BETWEEN_150_300)}
          ref={(el) =>
            (buttonRefs.current[PRICE_FILTER_TYPES.BETWEEN_150_300] = el)
          }
          className={`px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
            activeFilter === PRICE_FILTER_TYPES.BETWEEN_150_300
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          150 - 300 Juta
        </button>
        <button
          onClick={() => setActiveFilter(PRICE_FILTER_TYPES.OVER_300)}
          ref={(el) => (buttonRefs.current[PRICE_FILTER_TYPES.OVER_300] = el)}
          className={`px-3 py-1 lg:px-4 lg:py-1.5 text-xs lg:text-sm font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
            activeFilter === PRICE_FILTER_TYPES.OVER_300
              ? "bg-orange-100 text-orange-500 border border-orange-500"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Diatas 300 Juta
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

export default ProductByPrice;
