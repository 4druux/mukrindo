// layout/admin/AdminLayout.jsx
"use client";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/admin/AppHeader";
import AppSidebar from "@/layout/admin/AppSidebar";
import Backdrop from "@/layout/admin/Backdrop";
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { useRouter } from "next/navigation";
import DotLoader from "@/components/common/DotLoader";

export default function AdminLayout({ children }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { user, loading: authIsLoading, isAdmin } = useAuth();
  const { loading: productsAreLoading } = useProducts();
  const router = useRouter();

  useEffect(() => {
    if (authIsLoading) {
      return;
    }

    if (!user) {
      router.replace("/login");
    } else if (!isAdmin) {
      const params = new URLSearchParams();
      params.append("error", "admin_access_denied");
      params.append(
        "message",
        "Anda tidak memiliki izin untuk mengakses halaman admin."
      );
      router.replace(`/auth/callback?${params.toString()}`);
    }
  }, [user, authIsLoading, isAdmin, router]);

  if (
    authIsLoading ||
    (!authIsLoading && !user) ||
    (!authIsLoading && user && !isAdmin)
  ) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <DotLoader dotSize="w-6 h-6" />
      </div>
    );
  }

  if (productsAreLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <DotLoader dotSize="w-5 h-5" />
      </div>
    );
  }

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "xl:ml-[290px]"
    : "xl:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex bg-gray-50">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <main className="mx-auto max-w-[--breakpoint-2xl] md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
