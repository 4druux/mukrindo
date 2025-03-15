"use client";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const Carousel = ({
  images,
  onSlideChangeTransitionStart,
  onSlideChangeTransitionEnd,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [portalContainer, setPortalContainer] = useState(null);
  const [swiperInstance, setSwiperInstance] = useState(null); // Use useState

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  useEffect(() => {
    const portalDiv = document.createElement("div");
    document.body.appendChild(portalDiv);
    setPortalContainer(portalDiv);
    return () => {
      document.body.removeChild(portalDiv);
    };
  }, []);

  const handlePrevClick = () => {
    if (swiperInstance) {
      console.log("Previous slide button clicked");
      swiperInstance.slidePrev();
    }
  };

  const handleNextClick = () => {
    if (swiperInstance) {
      console.log("Next slide button clicked");
      swiperInstance.slideNext();
    }
  };
  const handleSlideChange = () => {
    if (swiperInstance) {
      console.log("Swiper Changed to index : ", swiperInstance.realIndex);
    }
  };

  return (
    <div
      className={`relative w-full max-h-[50vh] md:max-h-[60vh] overflow-hidden aspect-[2/1] ${
        isMobile ? "rounded-none" : " rounded-2xl"
      } `}
    >
      <Swiper
        modules={[Pagination, A11y, Autoplay]}
        spaceBetween={isMobile ? 16 : 10}
        slidesPerView={1}
        pagination={{
          clickable: true,
          dynamicBullets: !isMobile,
        }}
        loop={true}
        className="h-full"
        onSwiper={setSwiperInstance}
        style={{
          "--swiper-pagination-color": "#fff",
          "--swiper-pagination-bullet-inactive-color": "#999999",
          "--swiper-pagination-bullet-inactive-opacity": "1",
          "--swiper-pagination-bullet-size": "8px",
          "--swiper-pagination-bullet-horizontal-gap": "6px",
        }}
        onSlideChangeTransitionStart={() => {
          handleSlideChange();
          if (onSlideChangeTransitionStart) {
            onSlideChangeTransitionStart();
          }
        }}
        onSlideChangeTransitionEnd={onSlideChangeTransitionEnd}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index} className="relative">
            <Image
              src={image}
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover rounded-2xl"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </SwiperSlide>
        ))}
      </Swiper>
      {!isMobile &&
        portalContainer &&
        ReactDOM.createPortal(
          <div className="absolute top-1/2 left-6 right-6 flex justify-between transform -translate-y-1/2 z-20">
            <button
              onClick={handlePrevClick}
              className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-200 transition cursor-pointer"
            >
              <BsChevronLeft />
            </button>
            <button
              onClick={handleNextClick}
              className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-200 transition cursor-pointer"
            >
              <BsChevronRight />
            </button>
          </div>,
          portalContainer
        )}
    </div>
  );
};

export default Carousel;
