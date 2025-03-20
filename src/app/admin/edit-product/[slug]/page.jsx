// app/admin/edit-product/[slug]/page.jsx
import React from "react";
import EditProduct from "@/layout/admin/product/EditProduct";

export const metadata = {
  title: "Edit Produk - Mukrindo Motor",
  description: "Edit detail produk mobil.",
};

export default function EditProductPage({ params }) {
  const { slug } = params;
  // Extract ID from the slug
  const productId = slug.substring(slug.lastIndexOf("-") + 1);

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6">
      <EditProduct productId={productId} />
    </div>
  );
}
