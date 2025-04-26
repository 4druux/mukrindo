"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import BuySellCar from "@/layout/user/jual-mobil/BuySellCar";
import CarouselGlobal from "@/components/product-user/CarouselGlobal";
import BuySellBedge from "@/layout/user/jual-mobil/BuySellBedge";
import BuySellAccordion from "@/layout/user/jual-mobil/BuySellAccordion";

const SellCarPage = () => {
  const searchParams = useSearchParams();

  const initialBrand = searchParams.get("brand") || "";
  const initialModel = searchParams.get("model") || "";
  const initialYear = searchParams.get("year") || "";
  const initialPhoneNumberRaw = searchParams.get("phoneNumber") || "";

  return (
    <div className="min-h-screen">
      <CarouselGlobal
        imageUrl="/images/placeholder-banner.jpg"
        imageAlt="Jual Mobil Cepat dan Aman"
        title="Jual Mobil Cepat Laku & Aman"
        subtitle="Bebas Drama & Tipu-Tipu"
      />
      <BuySellCar
        initialBrand={initialBrand}
        initialModel={initialModel}
        initialYear={initialYear}
        initialPhoneNumber={initialPhoneNumberRaw}
      />

      <BuySellBedge />
      <BuySellAccordion />
    </div>
  );
};

export default SellCarPage;
