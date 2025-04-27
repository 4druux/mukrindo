"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import SellCar from "@/layout/user/jual-mobil/SellCar";
import CarouselGlobal from "@/components/product-user/CarouselGlobal";
import SellBedge from "@/layout/user/jual-mobil/SellBedge";
import SellAccordion from "@/layout/user/jual-mobil/SellAccordion";

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

      <div className="px-4 lg:px-0">
        <SellCar
          initialBrand={initialBrand}
          initialModel={initialModel}
          initialYear={initialYear}
          initialPhoneNumber={initialPhoneNumberRaw}
        />
        <SellBedge />
        <SellAccordion />
      </div>
    </div>
  );
};

export default SellCarPage;
