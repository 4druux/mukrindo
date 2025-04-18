"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import SellCar from "@/layout/user/jual-mobil/SellCar";
import CarouselGlobal from "@/components/global/CarouselGlobal";

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
      <SellCar
        initialBrand={initialBrand}
        initialModel={initialModel}
        initialYear={initialYear}
        initialPhoneNumber={initialPhoneNumberRaw}
      />
    </div>
  );
};

export default SellCarPage;
