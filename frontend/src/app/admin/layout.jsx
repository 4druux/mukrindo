// layout/admin/AdminLayout.jsx
"use client";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/admin/AppHeader";
import AppSidebar from "@/layout/admin/AppSidebar";
import Backdrop from "@/layout/admin/Backdrop";
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import DotLoader from "@/components/common/DotLoader";
// toast di sini bisa dihapus jika semua toast error akses ditangani oleh callback
// import toast from "react-hot-toast";

export default function AdminLayout({ children }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { user, loading, isAdmin } = useAuth(); // isAdmin sudah disediakan oleh AuthContext Anda
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; // Jangan lakukan apa-apa selama AuthContext masih loading
    }

    if (!user) {
      // Jika tidak ada user (belum login), arahkan ke halaman login
      router.replace("/login");
    } else if (!isAdmin) {
      // Jika ada user tapi BUKAN admin
      // **MODIFIKASI DI SINI:** Arahkan ke /auth/callback dengan parameter error
      const params = new URLSearchParams();
      params.append("error", "admin_access_denied");
      params.append(
        "message",
        "Anda tidak memiliki izin untuk mengakses halaman admin."
      );
      router.replace(`/auth/callback?${params.toString()}`);
      // Toast akan ditampilkan oleh halaman callback
    }
    // Jika user adalah admin, tidak ada redirect, komponen akan lanjut render children
  }, [user, loading, isAdmin, router]);

  // Kondisi untuk menampilkan loader:
  // 1. AuthContext masih loading.
  // 2. Selesai loading, tapi belum ada user (akan redirect ke login).
  // 3. Selesai loading, ada user, tapi bukan admin (akan redirect ke callback).
  if (loading || (!loading && !user) || (!loading && user && !isAdmin)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <DotLoader
          dotSize="w-5 h-5" // Sedikit diperbesar
          dotColor="bg-gradient-to-r from-orange-500 to-amber-500"
          text="Memeriksa sesi Anda..." // Teks yang lebih informatif
          textSize="text-lg"
          textColor="text-gray-700"
        />
      </div>
    );
  }

  // Jika lolos semua kondisi di atas, berarti user adalah admin yang terautentikasi
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
        <main className="mx-auto max-w-[--breakpoint-2xl] p-4 md:p-6">
          {" "}
          {/* Pastikan ada padding di main content */}
          {children}
        </main>
      </div>
    </div>
  );
}
