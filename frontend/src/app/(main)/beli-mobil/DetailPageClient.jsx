"use client";

import React, { useState, useEffect } from "react";
import { useProducts } from "@/context/ProductContext";
import axiosInstance from "@/utils/axiosInstance";
import { motion } from "framer-motion";

import BuyCarDetails from "@/layout/user/beli-mobil/BuyCarDetails";
import ProductRecommendations from "@/layout/user/beli-mobil/ProductRecommendations";
import Testimoni from "@/components/product-user/Testimoni";
import NotifyMeForm from "@/components/product-user/NotifyMeForm";
import BuyCarAccordion from "@/layout/user/beli-mobil/BuyCarAccordion";
import DotLoader from "@/components/common/DotLoader";
import { useRouter } from "next/navigation";
import ButtonMagnetic from "@/components/common/ButtonMagnetic";
import { IoArrowBack } from "react-icons/io5";

const DetailPageClient = ({ productId }) => {
  const router = useRouter();

  const { fetchProductById, incrementProductView } = useProducts();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) {
        setError("Product ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await incrementProductView(productId);

        const [productResult, recommendationsResponse] = await Promise.all([
          fetchProductById(productId),
          axiosInstance.get(`/api/products/${productId}/recommendations`),
        ]);

        if (productResult.success) {
          setProduct(productResult.data);
        } else {
          throw new Error(productResult.error || "Gagal memuat produk.");
        }

        if (recommendationsResponse.data.success) {
          setRecommendations(recommendationsResponse.data.recommendations);
        } else {
          console.warn(
            "Gagal mengambil rekomendasi:",
            recommendationsResponse.data.message
          );
          setRecommendations([]);
        }
      } catch (err) {
        console.error("Error fetching page data:", err);
        setError(err.message || "Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, fetchProductById, incrementProductView]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[90vh] bg-gray-50">
        <DotLoader />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6 md:p-10 text-center min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-6xl font-extrabold text-orange-500"
          >
            404
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-2 text-xl font-medium text-gray-500"
          >
            Mobil yang Anda cari tidak ditemukan.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.9,
              type: "spring",
              stiffness: 120,
            }}
            className="mt-6"
          >
            <ButtonMagnetic
              onClick={() => router.back("/")}
              icon={<IoArrowBack className="w-5 h-5" />}
            >
              Kembali
            </ButtonMagnetic>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="md:pt-5 lg:pt-10 md:border-t-2 md:border-gray-200 space-y-4 md:space-y-16">
        <BuyCarDetails product={product} />
        <ProductRecommendations recommendations={recommendations} />
        <Testimoni />
        <div
          id="notify-me-form-section"
          className="scroll-mt-20 md:scroll-mt-24"
        >
          <NotifyMeForm />
        </div>
        <BuyCarAccordion />
      </div>
    </div>
  );
};

export default DetailPageClient;
