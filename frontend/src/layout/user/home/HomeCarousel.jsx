// layout/user/product/HomeCarousel.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Import Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay } from "swiper/modules";
import "swiper/css";

// Import Icon
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const HomeCarousel = ({
  images,
  onSlideChangeTransitionStart,
  onSlideChangeTransitionEnd,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = images.length;
  const progressRef = useRef(null);

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

  const handlePrevClick = () => {
    swiperInstance?.slidePrev();
  };

  const handleNextClick = () => {
    swiperInstance?.slideNext();
  };

  const handleSlideChange = () => {
    if (swiperInstance) {
      const newSlideIndex = swiperInstance.realIndex;
      setCurrentSlide(newSlideIndex);
      onSlideChangeTransitionStart?.();
      resetProgress();
    }
  };
  const resetProgress = () => {
    if (progressRef.current) {
      progressRef.current.style.width = "0%";
      void progressRef.current.offsetWidth;
      requestAnimationFrame(() => {
        progressRef.current.style.width = "100%";
      });
    }
  };

  useEffect(() => {
    resetProgress();
  }, [currentSlide]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === totalSlides - 1;

  return (
    <div
      className="relative w-full max-h-[50vh] md:max-h-[60vh] aspect-[16/9]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Swiper
        modules={[A11y, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={false}
        className="h-full"
        onSwiper={setSwiperInstance}
        onSlideChangeTransitionStart={handleSlideChange}
        onSlideChangeTransitionEnd={onSlideChangeTransitionEnd}
        autoplay={{ delay: 5000 }}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index} className="relative">
            <Image
              src={image}
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL={image}
              priority={index === 0}
              fetchPriority={index === 0 ? "high" : "auto"}
              sizes="(max-width: 768px) 100vw, 100vw"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center px-2 py-1 space-x-1 bg-neutral-900/50 rounded-full">
          {images.map((_, index) => (
            <div
              key={index}
              className={`relative h-2 rounded-full transition-all duration-200 ${
                index === currentSlide ? "bg-gray-400" : "bg-gray-400/50"
              }`}
              style={{ width: index === currentSlide ? "24px" : "8px" }}
            >
              {index === currentSlide && (
                <div
                  ref={index === currentSlide ? progressRef : null}
                  className="absolute inset-0 bg-gray-50 h-full rounded-full z-10 transition-all duration-[5000ms] ease-linear"
                  style={{ width: "0%" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="hidden lg:block">
        {/* Tombol Kiri */}
        {!isFirstSlide && (
          <button
            onClick={handlePrevClick}
            className={`absolute top-1/2 left-4 transform -translate-y-1/2 z-20 w-11 h-11 bg-black/30 shadow-lg rounded-full flex items-center justify-center hover:bg-black/50 transition-opacity duration-300 cursor-pointer ${
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <BsChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Tombol Kanan */}
        {!isLastSlide && (
          <button
            onClick={handleNextClick}
            className={`absolute top-1/2 right-4 transform -translate-y-1/2 z-20 w-11 h-11 bg-black/30 shadow-lg rounded-full flex items-center justify-center hover:bg-black/50 transition-opacity duration-300 cursor-pointer ${
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <BsChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

export default HomeCarousel;
