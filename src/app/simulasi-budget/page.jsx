"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import SellCar from "@/layout/user/jual-mobil/BuySellCar";
import CarouselGlobal from "@/components/product-user/CarouselGlobal";

const BudgetSimulationPage = () => {
  const searchParams = useSearchParams();

  const initialBrand = searchParams.get("brand") || "";
  const initialModel = searchParams.get("model") || "";
  const initialYear = searchParams.get("year") || "";
  const initialPhoneNumberRaw = searchParams.get("phoneNumber") || "";
  return (
    <div className="min-h-screen">
      <CarouselGlobal
        imageUrl="/images/placeholder-banner.jpg"
        imageAlt="Simulasi Budget Pembelian Mobil"
        title="Simulasi Budget Pembelian Mobil"
        subtitle="Hitung Estimasi Cicilan dengan Mudah"
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

export default BudgetSimulationPage;
