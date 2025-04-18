"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import TradeInCar from "@/layout/user/tukar-tambah/TradeInCar";
import CarouselGlobal from "@/components/global/CarouselGlobal";

const TradeInCarPage = () => {
  const searchParams = useSearchParams();

  const initialBrand = searchParams.get("brand") || "";
  const initialModel = searchParams.get("model") || "";
  const initialYear = searchParams.get("year") || "";
  const initialPhoneNumberRaw = searchParams.get("phoneNumber") || "";
  return (
    <div className="min-h-screen">
      <CarouselGlobal
        imageUrl="/images/placeholder-banner.jpg"
        imageAlt="Tukar Tambah Mobil Lama Anda"
        title="Tukar Tambah Mobil Lebih Untung"
        subtitle="Dapatkan Penawaran Terbaik untuk Mobil Lama Anda"
      />
      <TradeInCar
        initialBrand={initialBrand}
        initialModel={initialModel}
        initialYear={initialYear}
        initialPhoneNumber={initialPhoneNumberRaw}
      />
    </div>
  );
};

export default TradeInCarPage;
