// app/admin/car-details/[slug]/page.jsx
import React from "react";
import CarDetails from "@/layout/admin/product/CarDetails"; 

export const metadata = {
  title: "Rincian Mobil - Mukrindo Motor",
  description: "Rincian produk mobil.",
};

export default function CarDetailspage({ params }) {
  const { slug } = params;
  const productId = slug.substring(slug.lastIndexOf("-") + 1);

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6">
      <CarDetails productId={productId} />
    </div>
  );
}
