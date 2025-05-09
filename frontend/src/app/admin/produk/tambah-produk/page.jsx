import React from "react";
import AddProduct from "@/layout/admin/product/AddProduct";

export const metadata = {
  title: "Admin Mukrindo Motor",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function AddProductPage() {
  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <AddProduct />
      </div>
    </div>
  );
}
