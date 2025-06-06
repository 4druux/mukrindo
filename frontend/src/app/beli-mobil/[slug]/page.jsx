// File: src/app/beli-mobil/[slug]/page.jsx

import React, { Suspense } from "react";
import DotLoader from "@/components/common/DotLoader";
import axiosInstance from "@/utils/axiosInstance";
import DetailPageClient from "../DetailPageClient";

async function getProductMetadata(productId) {
  try {
    const response = await axiosInstance.get(`/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch product metadata:", error);
    return null;
  }
}

export async function generateMetadata(props) {
  const slug = props.params.slug;
  const productId = slug.substring(slug.lastIndexOf("-") + 1);
  const product = await getProductMetadata(productId);

  if (!product) {
    return {
      title: "Detail Mobil | Mukrindo Motor",
      description: "Detail mobil tidak ditemukan.",
    };
  }

  return {
    title: `${product.carName} | Mukrindo Motor`,
    description: `Detail spesifikasi dan harga untuk ${product.carName}.`,
  };
}

export default async function DetailCarPage(props) {
  const slug = props.params.slug;
  const productId = slug.substring(slug.lastIndexOf("-") + 1);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[90vh] bg-gray-50">
          <DotLoader />
        </div>
      }
    >
      <DetailPageClient productId={productId} />
    </Suspense>
  );
}
