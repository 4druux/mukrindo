// components/product/CarImage.js
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { useRouter } from "next/navigation";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import "swiper/css/navigation";
import { FreeMode, Thumbs, Navigation } from "swiper/modules";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

const CarImage = ({ images, carName, isExpanded, isHovered, onImageClick }) => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbsSwiperMobile, setThumbsSwiperMobile] = useState(null);
  const [thumbsSwiperDesktop, setThumbsSwiperDesktop] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);

  // --- Detect Mobile (Optional but can be helpful for explicit logic) ---
  const [isLikelyMobile, setIsLikelyMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsLikelyMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="h-[200px] lg:h-[400px] bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500">
        No Images Available
      </div>
    );
  }

  const desktopMainImageHeightClass =
    !isExpanded && !isHovered ? "lg:h-[550px]" : "lg:h-[480px]";
  const desktopThumbsHeightClass =
    !isExpanded && !isHovered ? "lg:h-[550px]" : "lg:h-[480px]";

  // Determine which thumbs swiper is currently relevant
  const relevantThumbsSwiper = isLikelyMobile
    ? thumbsSwiperMobile
    : thumbsSwiperDesktop;
  const thumbsConfig = {
    swiper:
      relevantThumbsSwiper && !relevantThumbsSwiper.destroyed
        ? relevantThumbsSwiper
        : null,
  };

  return (
    <div className="px-2 lg:px-0">
      <div className="lg:flex lg:flex-row lg:gap-4">
        {/* Vertical Thumbnail Desktop */}
        <div
          className={`hidden lg:block lg:w-[200px] lg:flex-shrink-0 ${desktopThumbsHeightClass} transition-all duration-500 ease-in-out
       relative overflow-hidden vertical-gradient-fade 
      `}
        >
          <Swiper
            onSwiper={setThumbsSwiperDesktop}
            direction={"vertical"}
            spaceBetween={10}
            slidesPerView={"auto"}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Thumbs, Navigation]}
            className="mySwiper-desktop h-full w-full rounded-lg"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index} className="!h-[100px] w-full">
                <div
                  className={`relative w-full h-full cursor-pointer group rounded-md overflow-hidden ${
                    index === activeIndex
                      ? "border-2 border-orange-400"
                      : "border-2 border-transparent"
                  }`}
                  onClick={() => mainSwiper?.slideTo(index)}
                >
                  <Image
                    src={image}
                    alt={`${carName} - Thumbnail ${index + 1}`}
                    layout="fill"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Main Image */}
        <div className="lg:flex-1 relative lg:min-w-0">
          <div
            className={`relative h-[210px] rounded-2xl mb-4 lg:mb-0 transition-all duration-500 ease-in-out ${desktopMainImageHeightClass} overflow-hidden`}
          >
            <Swiper
              onSwiper={setMainSwiper}
              spaceBetween={isLikelyMobile ? 10 : 0}
              thumbs={thumbsConfig}
              modules={[FreeMode, Thumbs]}
              className="mySwiper2 rounded-2xl h-full"
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div
                    className={`relative h-full cursor-pointer group`}
                    onClick={() => onImageClick(index)}
                  >
                    <Image
                      src={image}
                      alt={`${carName} - ${index + 1}`}
                      layout="fill"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="absolute bottom-3 right-2 bg-black/30 text-white text-xs px-3 py-2 rounded-full z-10">
              {activeIndex + 1} / {images.length}
            </div>

            {/* Back Button Mobile */}
            <div className="block lg:hidden">
              <button
                onClick={() => router.back()}
                className="absolute top-2 left-2 bg-gray-100 p-2 rounded-full z-10 shadow"
              >
                <ArrowLeft className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Thumbnail Mobile */}
        <div className="lg:hidden mt-4 relative overflow-hidden horizontal-gradient-fade">
          <Swiper
            onSwiper={setThumbsSwiperMobile}
            spaceBetween={4}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Thumbs]}
            className="mySwiper-mobile rounded-lg"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div
                  className={`relative w-auto h-[55px] cursor-pointer group rounded-md overflow-hidden ${
                    index === activeIndex
                      ? "border-2 border-orange-400"
                      : "border-2 border-transparent"
                  }`}
                  onClick={() => mainSwiper?.slideTo(index)}
                >
                  <Image
                    src={image}
                    alt={`${carName} - Thumbnail ${index + 1}`}
                    layout="fill"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default CarImage;
