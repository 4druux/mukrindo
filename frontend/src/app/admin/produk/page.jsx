import React, { Suspense } from "react";
import AllProducts from "@/layout/admin/product/AllProuduct";

export const metadata = {
  title: "Admin Mukrindo Motor",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function AllProductsPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <AllProducts />
      </Suspense>
    </div>
  );
}
