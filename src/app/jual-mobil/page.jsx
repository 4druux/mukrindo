"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import SellCar from "@/layout/user/jual-mobil/SellCar";
import SellCarousel from "@/layout/user/jual-mobil/SellCarousel";

const SellCarPage = () => {
  const searchParams = useSearchParams();

  // 5. Ambil nilai awal dari URL
  const initialBrand = searchParams.get("brand") || "";
  const initialModel = searchParams.get("model") || "";
  const initialYear = searchParams.get("year") || "";
  const initialPhoneNumberRaw = searchParams.get("phoneNumber") || "";

  return (
    <div className="min-h-screen bg-gray-100">
      <SellCarousel />
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
