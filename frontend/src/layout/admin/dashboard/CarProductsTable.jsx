"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import generateSlug from "@/utils/generateSlug";
import { FaEye } from "react-icons/fa";
import { useProducts } from "@/context/ProductContext";
import SkeletonCarProductsTable from "@/components/skeleton/skeleton-admin/SkeletonCarProductsTable";
import { motion, AnimatePresence } from "framer-motion";

const MotionLink = motion(Link);

const TAB_CONFIG = [
  {
    id: "All",
    label: "Semua Produk",
    title: "Semua Produk Mobil",
    filterLogic: (products) => products,
  },
  {
    id: "tersedia",
    label: "Produk Tersedia",
    title: "Produk Mobil Tersedia",
    filterLogic: (products, tabId) =>
      products.filter(
        (product) => product.status?.toLowerCase() === tabId.toLowerCase()
      ),
  },
  {
    id: "terjual",
    label: "Produk Terjual",
    title: "Produk Mobil Terjual",
    filterLogic: (products, tabId) =>
      products.filter(
        (product) => product.status?.toLowerCase() === tabId.toLowerCase()
      ),
  },
  {
    id: "tercepat",
    label: "Jual Tercepat",
    title: "Produk Mobil Tercepat Terjual",
    isSortBased: true,
  },
  {
    id: "terlama",
    label: "Jual Terlama",
    title: "Produk Mobil Terlama Terjual",
    isSortBased: true,
  },
];

const DATE_FORMAT_OPTIONS = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

const CarProductsTable = () => {
  const { products, loading, error } = useProducts();
  const [selectedTabId, setSelectedTabId] = useState(TAB_CONFIG[0].id);

  const tabCounts = useMemo(() => {
    if (loading || !products) {
      return {};
    }
    const tersediaCount = products.filter(
      (p) => p.status?.toLowerCase() === "tersedia"
    ).length;
    const terjualCount = products.filter(
      (p) => p.status?.toLowerCase() === "terjual"
    ).length;

    return {
      All: products.length,
      tersedia: tersediaCount,
      terjual: terjualCount,
      tercepat: terjualCount,
      terlama: terjualCount,
    };
  }, [products, loading]);

  if (error) {
    console.error("Error loading products:", error);
    return <div className="p-4 text-red-500">Gagal memuat produk.</div>;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "tersedia":
        return "bg-green-100 text-green-700";
      case "terjual":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const validImages = (images) => {
    if (Array.isArray(images)) {
      const validImage = images.find(
        (img) =>
          typeof img === "string" &&
          img.trim() !== "" &&
          (img.startsWith("http") || img.startsWith("/"))
      );
      return validImage || "/placeholder-car.png";
    }
    return "/placeholder-car.png";
  };

  const currentSelectedTabConfig = useMemo(
    () => TAB_CONFIG.find((tab) => tab.id === selectedTabId) || TAB_CONFIG[0],
    [selectedTabId]
  );

  const displayedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    const {
      id: tabId,
      isSortBased,
      filterLogic: tabFilterLogic,
    } = currentSelectedTabConfig;

    if (isSortBased) {
      const soldProductsWithDuration = products
        .filter(
          (p) =>
            p.status?.toLowerCase() === "terjual" && p.createdAt && p.updatedAt
        )
        .map((p) => ({
          ...p,
          sellingDuration:
            new Date(p.updatedAt).getTime() - new Date(p.createdAt).getTime(),
        }));

      soldProductsWithDuration.sort((a, b) => {
        if (tabId === "tercepat") {
          return a.sellingDuration - b.sellingDuration;
        } else {
          return b.sellingDuration - a.sellingDuration;
        }
      });
      return soldProductsWithDuration;
    }

    if (tabFilterLogic) {
      return tabFilterLogic(products, tabId);
    }

    return products;
  }, [products, currentSelectedTabConfig]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const listItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="border border-gray-200 md:border-none md:rounded-2xl md:shadow-md px-3 bg-white pb-5 pt-5 sm:px-6 sm:pt-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex flex-col gap-2 md:gap-5 mb-2 md:mb-6 sm:flex-row sm:items-center sm:justify-between"
        variants={itemVariants}
      >
        <div className="w-full">
          <h3 className="text-md lg:text-lg font-medium text-gray-700">
            {currentSelectedTabConfig.title}
          </h3>
        </div>

        <div className="flex items-start w-full gap-3 sm:w-auto sm:justify-end">
          <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-1 w-full sm:w-auto">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTabId(tab.id)}
                className={`px-1 lg:px-3 py-1.5 font-semibold w-full rounded-md text-[10px] md:text-xs cursor-pointer transition-colors duration-150 ${
                  selectedTabId === tab.id
                    ? "text-orange-600 bg-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                {tabCounts[tab.id] !== undefined && (
                  <span
                    className={`ml-0.5 lg:ml-1 text-[10px] ${
                      selectedTabId === tab.id
                        ? "text-orange-600"
                        : "text-gray-600"
                    }`}
                  >
                    ({tabCounts[tab.id]})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="hidden sm:grid sm:grid-cols-12 sm:gap-x-4 py-3 border-b border-gray-200 bg-gray-50 px-2 rounded-t-md">
          <div className="sm:col-span-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Produk
          </div>
          <div className="sm:col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider text-left">
            Harga
          </div>
          <div className="sm:col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider text-left">
            Tgl Masuk
          </div>
          <div className="sm:col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider text-left">
            Tgl Keluar
          </div>
          <div className="sm:col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wider text-left">
            Status
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTabId}
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
          >
            {loading ? (
              Array(5)
                .fill(null)
                .map((_, index) => <SkeletonCarProductsTable key={index} />)
            ) : displayedProducts.length > 0 ? (
              displayedProducts.map((product) => (
                <MotionLink
                  key={product._id}
                  href={`/admin/produk/detail-mobil/${generateSlug(
                    product.carName || `${product.brand} ${product.model}`,
                    product._id
                  )}`}
                  className="flex sm:grid sm:grid-cols-12 sm:gap-x-4 items-start sm:items-center py-4 px-2 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 group"
                  variants={listItemVariants}
                >
                  <div className="flex flex-1 items-start sm:col-span-4 sm:flex sm:items-center sm:gap-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-16 sm:w-20 sm:h-12 relative">
                        <Image
                          src={validImages(product.images)}
                          alt={
                            product.carName ||
                            `${product.brand} ${product.model}`
                          }
                          layout="fill"
                          objectFit="cover"
                          className="rounded-md"
                        />
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-0 flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {product.brand} {product.model} - {product.variant}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5 text-gray-500 text-xs">
                        <FaEye className="w-3 h-3" />
                        <span>{product.viewCount || 0} Dilihat</span>
                      </div>
                      <div className="mt-1 sm:hidden">
                        <div className="flex items-start gap-2">
                          <p className="text-sm text-orange-600 font-medium">
                            {formatPrice(product.price)}
                          </p>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusClass(
                              product.status
                            )}`}
                          >
                            {product.status || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center mt-1 gap-2">
                          <p className="text-xs text-gray-500">
                            Masuk:{" "}
                            {new Date(product.createdAt).toLocaleDateString(
                              "id-ID",
                              DATE_FORMAT_OPTIONS
                            )}
                          </p>
                          <span className="text-xs text-gray-500">|</span>
                          <p className="text-xs text-gray-500">
                            Keluar:{" "}
                            {product.status?.toLowerCase() === "terjual" &&
                            product.updatedAt
                              ? new Date(product.updatedAt).toLocaleDateString(
                                  "id-ID",
                                  DATE_FORMAT_OPTIONS
                                )
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex sm:col-span-2 sm:items-center text-sm text-orange-600 font-medium sm:justify-start">
                    {formatPrice(product.price)}
                  </div>
                  <div className="hidden sm:flex sm:col-span-2 sm:items-center sm:text-sm sm:text-gray-700 sm:justify-start">
                    {new Date(product.createdAt).toLocaleDateString(
                      "id-ID",
                      DATE_FORMAT_OPTIONS
                    )}
                  </div>
                  <div className="hidden sm:flex sm:col-span-2 sm:items-center sm:text-sm sm:text-gray-700 sm:justify-start">
                    {product.status?.toLowerCase() === "terjual" &&
                    product.updatedAt
                      ? new Date(product.updatedAt).toLocaleDateString(
                          "id-ID",
                          DATE_FORMAT_OPTIONS
                        )
                      : "-"}
                  </div>
                  <div className="hidden sm:flex sm:col-span-2 sm:items-center sm:justify-start">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusClass(
                        product.status
                      )}`}
                    >
                      {product.status || "N/A"}
                    </span>
                  </div>
                </MotionLink>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                {products && products.length > 0
                  ? `Tidak ada produk mobil yang sesuai dengan kriteria "${currentSelectedTabConfig.label.toLowerCase()}".`
                  : "Tidak ada produk mobil yang ditemukan."}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
export default CarProductsTable;
