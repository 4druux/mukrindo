// frontend/src/app/page.js
"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

import CarForm from "@/layout/user/home/CarForm";
import HomeAccordion from "@/layout/user/home/HomeAccordion";
import HomeBedge from "@/layout/user/home/HomeBedge";
import NotifyMeForm from "@/components/product-user/NotifyMeForm";
import HomeCarousel from "@/layout/user/home/HomeCarousel";
import ProductByPrice from "@/layout/user/home/ProductByPrice";
import ProductByRecom from "@/layout/user/home/ProductByRecom";
import Testimoni from "@/components/product-user/Testimoni";
import { useTraffic } from "@/context/TrafficContext";
import DotLoader from "@/components/common/DotLoader";

function HomePageLogicAndContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { handleOAuthSuccess } = useAuth();
  const { trackHomepageVisit } = useTraffic();

  const bannerImages = [
    "/images/placeholder-banner.webp",
    "/images/placeholder-banner.webp",
    "/images/placeholder-banner.webp",
    "/images/placeholder-banner.webp",
  ];

  useEffect(() => {
    if (trackHomepageVisit) {
      trackHomepageVisit().then((result) => {});
    }
  }, [trackHomepageVisit]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
  }, [searchParams, router, pathname, handleOAuthSuccess]);

  return (
    <div>
      <HomeCarousel images={bannerImages} />
      <div className="container mx-auto space-y-4 md:space-y-16 mt-4 md:mt-10">
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

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <DotLoader dotSize="w-5 h-5" />
        </div>
      }
    >
      <HomePageLogicAndContent />
    </Suspense>
  );
}
