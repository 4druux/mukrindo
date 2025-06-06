"use client";

import React, { useState, useEffect } from "react";
import { useProducts } from "@/context/ProductContext";
import axiosInstance from "@/utils/axiosInstance";

import BuyCarDetails from "@/layout/user/beli-mobil/BuyCarDetails";
import ProductRecommendations from "@/layout/user/beli-mobil/ProductRecommendations";
import Testimoni from "@/components/product-user/Testimoni";
import NotifyMeForm from "@/components/product-user/NotifyMeForm";
import BuyCarAccordion from "@/layout/user/beli-mobil/BuyCarAccordion";
import DotLoader from "@/components/common/DotLoader";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

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
        <DotLoader text="Memuat detail mobil..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6 md:p-10 text-center text-red-600 h-[80vh] bg-gray-50 flex flex-col justify-center items-center">
        <p className="text-xl mb-4">
          {error || "Produk tidak ditemukan atau gagal dimuat."}
        </p>
        <button
          onClick={() => router.back()}
          className="flex items-center bg-orange-400 hover:bg-orange-500 text-white py-2 px-4 rounded-full cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-sm">Kembali</span>
        </button>
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
