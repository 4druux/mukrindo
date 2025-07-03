// Misalnya di: components/product-user/CarouselGlobal.jsx
import React from "react";
import Image from "next/image";

const CarouselGlobal = ({ imageUrl, imageAlt, title, subtitle }) => {
  return (
    <div>
      <div className="relative w-full max-h-[50vh] md:max-h-[60vh] aspect-[16/9]">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 100vw"
        />
        <div className="absolute inset-0 bg-black opacity-10"></div>
        {/* Teks di atas Banner */}
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-gradient-to-r from-neutral-50 via-neutral-100 to-neutral-300 bg-clip-text text-transparent text-center p-4 z-10">
          <h1 className="text-xl md:text-5xl font-bold lg:mb-4">{title}</h1>
          <p className="text-sm font-semibold md:text-xl">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default CarouselGlobal;
