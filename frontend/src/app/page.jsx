// frontend/src/app/page.js (atau Home.js)
"use client";
import React, { useEffect, Suspense } from "react";
// Impor hook yang diperlukan dari Next.js dan AuthContext
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Pastikan path ini benar
import toast from "react-hot-toast"; // Untuk menampilkan pesan error jika diperlukan

import CarForm from "@/layout/user/home/CarForm";
import HomeAccordion from "@/layout/user/home/HomeAccordion";
import HomeBedge from "@/layout/user/home/HomeBedge";
import NotifyMeForm from "@/components/product-user/NotifyMeForm";
import HomeCarousel from "@/layout/user/home/HomeCarousel";
import ProductByPrice from "@/layout/user/home/ProductByPrice";
import ProductByRecom from "@/layout/user/home/ProductByRecom";
import Testimoni from "@/components/product-user/Testimoni";
import { useTraffic } from "@/context/TrafficContext";

export default function Home() {
  const bannerImages = [
    "/images/placeholder-banner.webp",
    "/images/placeholder-banner.webp",
    "/images/placeholder-banner.webp",
    "/images/placeholder-banner.webp",
  ];

  const { trackHomepageVisit } = useTraffic();

  // Hook untuk OAuth dan navigasi
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname(); // Digunakan untuk membersihkan URL jika perlu
  const { handleOAuthSuccess } = useAuth(); // Ambil fungsi dari AuthContext

  // useEffect untuk melacak kunjungan (sudah ada)
  useEffect(() => {
    trackHomepageVisit().then((result) => {
      if (result.success) {
        // console.log("Homepage visit tracked from Home page.");
      } else {
        // console.error("Failed to track homepage visit from Home page:", result.error);
      }
    });
  }, [trackHomepageVisit]);

  // useEffect untuk scroll ke atas (sudah ada)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // useEffect baru untuk menangani parameter OAuth
  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");
    const userId = searchParams.get("userId");
    const firstName = searchParams.get("firstName");
    const email = searchParams.get("email");
    const oauthCallbackError = searchParams.get("error"); // Menangkap parameter error dari backend

    if (token && role && userId && email && firstName !== null) {
      // Parameter OAuth sukses terdeteksi
      const oauthData = {
        token,
        role,
        _id: userId,
        firstName: decodeURIComponent(firstName),
        email: decodeURIComponent(email),
        // Pesan sukses bisa diatur di handleOAuthSuccess atau di sini
        // message: "Login dengan Google berhasil!"
      };

      // Panggil handleOAuthSuccess. Ini akan menyimpan token, setUser,
      // menampilkan toast, dan melakukan navigasi (ke / atau /admin).
      // Navigasi yang dilakukan oleh handleOAuthSuccess akan membersihkan URL.
      handleOAuthSuccess(oauthData);

      // Membersihkan URL secara eksplisit (opsional, karena handleOAuthSuccess sudah navigasi)
      // Jika Anda ingin memastikan URL bersih bahkan sebelum navigasi dari handleOAuthSuccess selesai,
      // Anda bisa menggunakan ini, tapi biasanya navigasi dari context sudah cukup.
      // router.replace(pathname, undefined, { shallow: true });
    } else if (oauthCallbackError) {
      // Ada parameter 'error' di URL dari proses OAuth
      console.error("OAuth Error from URL:", oauthCallbackError);
      let errorMessage = "Terjadi kesalahan saat login dengan Google.";
      if (oauthCallbackError === "oauth_incomplete_params_callback") {
        errorMessage = "Login OAuth gagal, parameter tidak lengkap.";
      } else if (oauthCallbackError === "google_auth_failed") {
        errorMessage = "Autentikasi Google gagal di server.";
      }
      // Tambahkan penanganan untuk kode error lain jika ada

      toast.error(errorMessage, { className: "custom-toast" });

      // Bersihkan parameter error dari URL agar tidak muncul terus-menerus
      router.replace(pathname, undefined, { shallow: true });
    }

    // Dependensi useEffect:
    // searchParams: untuk memicu efek saat query params berubah.
    // router, pathname, handleOAuthSuccess: fungsi dan objek stabil atau memoized.
    // Perhatikan: Jika searchParams adalah objek yang selalu baru pada setiap render,
    // ini bisa menyebabkan loop. Namun, hook useSearchParams dari Next.js biasanya dioptimalkan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router, pathname, handleOAuthSuccess]); // Tambahkan dependensi

  return (
    <div className="container mx-auto">
      <p className="md:pt-5 lg:pt-10 border-t-2 border-gray-200"></p>
      <HomeCarousel images={bannerImages} />
      <div className="space-y-4 md:space-y-16 mt-4 md:mt-10">
        <Suspense fallback={<div>Loading CarForm...</div>}>
          <CarForm />
        </Suspense>
        <ProductByRecom />
        <ProductByPrice />
        <Testimoni />
        <NotifyMeForm />
        <HomeBedge />
        <HomeAccordion />
      </div>
    </div>
  );
}
