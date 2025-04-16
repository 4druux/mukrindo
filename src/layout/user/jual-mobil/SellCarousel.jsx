// components/sell-car/SellCarousel.jsx
import React from "react";
import Image from "next/image";

const SellCarousel = () => {
  return (
    <div>
      <div className="relative w-full max-h-[50vh] md:max-h-[60vh] aspect-[16/9]">
        <Image
          src={"/images/placeholder-banner.jpg"}
          alt="Jual Mobil Cepat dan Aman"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 100vw"
        />
        <div className="absolute inset-0 bg-black opacity-30"></div>
        {/* Contoh Teks di atas Banner (Opsional) */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-4 z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Jual Mobil Cepat Laku & Aman
          </h1>
          <p className="text-lg md:text-xl">Bebas Drama & Tipu-Tipu</p>
        </div>
      </div>
    </div>
  );
};

export default SellCarousel;
