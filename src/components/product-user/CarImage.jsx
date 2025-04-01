// components/product-user/CarImage.jsx
"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FaShoppingBag } from "react-icons/fa";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, A11y } from "swiper/modules";

const CarImage = ({ images, altText, status }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const validImages = Array.isArray(images) && images.length > 0 ? images : [];

  const totalDots = validImages.length;
  const maxVisibleDots = 5;
  let startDot = 0;
  let endDot = totalDots - 1;

  const visibleDotsIndices = [];

  if (totalDots > 1) {
    if (totalDots > maxVisibleDots) {
      startDot = Math.max(0, activeIndex - Math.floor(maxVisibleDots / 2));
      endDot = Math.min(totalDots - 1, startDot + maxVisibleDots - 1);

      if (endDot - startDot + 1 < maxVisibleDots) {
        if (activeIndex < totalDots / 2) {
          endDot = Math.min(totalDots - 1, maxVisibleDots - 1);
        } else {
          startDot = Math.max(0, totalDots - maxVisibleDots);
        }
      }
    }
    for (let i = startDot; i <= endDot; i++) {
      visibleDotsIndices.push(i);
    }
  }

  if (validImages.length === 0) {
    return (
      <div className="relative w-full aspect-[16/9] bg-gray-200 flex items-center justify-center">
        <Image
          src="/placeholder-image.png"
          alt={altText || "Placeholder Image"}
          layout="fill"
          objectFit="cover"
          className="object-cover opacity-50"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full group aspect-[16/9]">
      <Swiper
        modules={[Navigation, A11y]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        loop={validImages.length > 1}
        className="h-full w-full"
        a11y={{
          prevSlideMessage: "Previous slide",
          nextSlideMessage: "Next slide",
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        allowTouchMove={status !== "Terjual"}
      >
        {validImages.map((image, index) => (
          <SwiperSlide key={index}>
            <Image
              src={image}
              alt={`${altText} - Gambar ${index + 1}`}
              layout="fill"
              objectFit="cover"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
              className="object-cover"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </SwiperSlide>
        ))}

        {validImages.length > 1 && (
          <>
            <div className="hidden lg:block">
              <button
                aria-label="Previous Slide"
                className={`swiper-button-prev-custom absolute mt-0.5 top-1/2 left-2 transform -translate-y-1/2 z-10 p-2 
                bg-black/30 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                hover:bg-black/50 cursor-pointer ${
                  status === "Terjual" ? "hidden" : ""
                }`}
              >
                <BsChevronLeft size={24} />
              </button>
              <button
                aria-label="Next Slide"
                className={`swiper-button-next-custom absolute top-1/2 right-2 transform -translate-y-1/2 z-10 p-2 
                bg-black/30 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                hover:bg-black/50 cursor-pointer  ${
                  status === "Terjual" ? "hidden" : ""
                }`}
              >
                <BsChevronRight size={24} />
              </button>
            </div>
          </>
        )}
      </Swiper>
      {totalDots > 1 && (
        <div
          className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 ${
            status === "Terjual" ? "hidden" : ""
          }`}
        >
          <div className="flex items-center space-x-1.5 bg-black/10 backdrop-blur-sm px-2 py-1 rounded-full">
            {/* Render dot yang terlihat */}
            {visibleDotsIndices.map((index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ease-in-out flex-shrink-0 ${
                  index === activeIndex
                    ? "bg-orange-500 w-5"
                    : "bg-gray-300 w-2"
                }`}
              />
            ))}
          </div>
        </div>
      )}
      {status === "Terjual" && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60 pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-center">
            <FaShoppingBag className="w-10 h-10 text-gray-50" />
            <p className="text-md text-gray-50 px-4">Unit telah terjual</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarImage;
