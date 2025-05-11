// Home.js (misalnya frontend/src/app/page.js)
"use client";
import React, { useEffect } from "react";
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
    "/images/carousel/carousel-1.jpg",
    "/images/carousel/carousel-2.jpg",
    "/images/carousel/carousel-3.jpg",
    "/images/carousel/carousel-4.jpg",
    "/images/carousel/2.jpg",
    "/images/carousel/5.jpg",
    "/images/carousel/7.jpg",
  ];

  const { trackHomepageVisit } = useTraffic();
  useEffect(() => {
    trackHomepageVisit().then((result) => {
      if (result.success) {
        // console.log("Homepage visit tracked from Home page.");
      } else {
        // console.error("Failed to track homepage visit from Home page:", result.error);
      }
    });
  }, [trackHomepageVisit]);

  return (
    <div className="container mx-auto">
      <p className="md:pt-5 lg:pt-10 border-t-2 border-gray-200"></p>
      <HomeCarousel images={bannerImages} />
      <div className="space-y-4 md:space-y-16 mt-4 md:mt-10">
        <CarForm />
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
