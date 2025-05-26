// frontend/src/app/page.js (atau file Home.js Anda)
"use client"; // Komponen ini sudah "use client" karena menggunakan hooks

import React, { useEffect, Suspense } from "react"; // Impor Suspense dari React
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

// Impor komponen-komponen konten homepage Anda
import CarForm from "@/layout/user/home/CarForm";
import HomeAccordion from "@/layout/user/home/HomeAccordion";
import HomeBedge from "@/layout/user/home/HomeBedge";
import NotifyMeForm from "@/components/product-user/NotifyMeForm";
import HomeCarousel from "@/layout/user/home/HomeCarousel";
import ProductByPrice from "@/layout/user/home/ProductByPrice";
import ProductByRecom from "@/layout/user/home/ProductByRecom";
import Testimoni from "@/components/product-user/Testimoni";
import { useTraffic } from "@/context/TrafficContext"; // Pastikan ini diimpor jika digunakan
import DotLoader from "@/components/common/DotLoader"; // Impor loader Anda

// Buat komponen internal yang akan menggunakan hooks dan logika terkait searchParams
function HomePageLogicAndContent() {
  const searchParams = useSearchParams(); // Penggunaan hook ini yang memerlukan Suspense
  const router = useRouter();
  const pathname = usePathname();
  const { handleOAuthSuccess } = useAuth();
  const { trackHomepageVisit } = useTraffic(); // Pastikan useTraffic sudah di-provide di context jika perlu

  const bannerImages = [
    "/images/placeholder-banner.webp",
    "/images/placeholder-banner.webp",
    "/images/placeholder-banner.webp",
    "/images/placeholder-banner.webp",
  ];

  // useEffect untuk melacak kunjungan (dari kode asli Anda)
  useEffect(() => {
    if (trackHomepageVisit) {
      // Pastikan fungsi ada sebelum dipanggil
      trackHomepageVisit().then((result) => {
        // Handle result
      });
    }
  }, [trackHomepageVisit]);

  // useEffect untuk scroll ke atas (dari kode asli Anda)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // useEffect untuk menangani parameter OAuth (dari solusi sebelumnya)
  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");
    const userId = searchParams.get("userId");
    const firstNameFromParams = searchParams.get("firstName");
    const email = searchParams.get("email");
    const oauthCallbackError = searchParams.get("error");

    if (token && role && userId && email && firstNameFromParams !== null) {
      const oauthData = {
        token,
        role,
        _id: userId,
        firstName: decodeURIComponent(firstNameFromParams),
        email: decodeURIComponent(email),
      };
      handleOAuthSuccess(oauthData);
    } else if (oauthCallbackError) {
      toast.error(
        `Login OAuth gagal: ${
          oauthCallbackError === "oauth_incomplete_params_callback"
            ? "Parameter tidak lengkap."
            : oauthCallbackError
        }`,
        { className: "custom-toast" }
      );
      router.replace(pathname, undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router, pathname, handleOAuthSuccess]); // Dependensi

  // Kembalikan JSX untuk konten homepage Anda
  return (
    <div className="container mx-auto">
      <p className="md:pt-5 lg:pt-10 border-t-2 border-gray-200"></p>
      <HomeCarousel images={bannerImages} />
      <div className="space-y-4 md:space-y-16 mt-4 md:mt-10">
        <Suspense
          fallback={
            <div className="text-center py-10">Memuat form mobil...</div>
          }
        >
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

// Komponen Loader untuk fallback Suspense utama
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      {" "}
      {/* Sesuaikan min-h */}
      <DotLoader
        dotSize="w-5 h-5"
        dotColor="bg-gradient-to-r from-orange-500 to-amber-500"
        textSize="text-xl"
        textColor="text-gray-700"
      />
      <p className="mt-4 text-gray-600">Memuat halaman...</p>
    </div>
  );
}

// Komponen Home (default export untuk app/page.js)
export default function Home() {
  return (
    <Suspense fallback={<PageLoader />}>
      <HomePageLogicAndContent />
    </Suspense>
  );
}
