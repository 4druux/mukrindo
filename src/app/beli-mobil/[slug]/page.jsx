// app/beli-mobil/[slug]/page.jsx

import CarDetails from "@/layout/user/beli-mobil/CarDetails";
import React from "react";

export default function DetailCarPage({ params }) {
  const { slug } = params;
  const productId = slug.substring(slug.lastIndexOf("-") + 1);

  return (
    <div className="lg:pt-10 border-t-2 border-gray-200">
      <CarDetails productId={productId} />
    </div>
  );
}
