import React, { Suspense } from "react";
import TradeInCar from "@/layout/user/tukar-tambah/TradeInCar";
import CarouselGlobal from "@/components/product-user/CarouselGlobal";
import TradeInBedge from "@/layout/user/tukar-tambah/TradeInBedge";
import TradeInAccordion from "@/layout/user/tukar-tambah/TradeInAccordion";
import DotLoader from "@/components/common/DotLoader";

export const metadata = {
  title: "Tukar Tambah  | Mukrindo Motor",
  description: "Generated by Mukrindo Motor",
};

const TradeInCarPage = () => {
  return (
    <div className="min-h-screen">
      <CarouselGlobal
        imageUrl="/images/placeholder-banner.webp"
        imageAlt="Tukar Tambah Mobil Lama Anda"
        title="Tukar Tambah Mobil Lebih Untung"
        subtitle="Dapatkan Penawaran Terbaik untuk Mobil Lama Anda"
      />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen bg-gray-50">
            <DotLoader dotSize="w-5 h-5" />
          </div>
        }
      >
        <TradeInCar />
      </Suspense>
      <div className="px-4 lg:px-0 space-y-8 lg:space-y-16">
        <TradeInBedge />
        <TradeInAccordion />
      </div>
    </div>
  );
};

export default TradeInCarPage;
