"use client";
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import Image from "next/image";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const Carousel = ({
  images,
  onSlideChangeTransitionStart,
  onSlideChangeTransitionEnd,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [portalContainer, setPortalContainer] = useState(null);
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

  useEffect(() => {
    const portalDiv = document.createElement("div");
    portalDiv.id = "carousel-buttons-portal";
    document.body.appendChild(portalDiv);
    setPortalContainer(portalDiv);
    return () => {
      if (portalDiv.parentNode) {
        document.body.removeChild(portalDiv);
      }
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
      className="relative w-full max-h-[50vh] md:max-h-[60vh] overflow-hidden aspect-[2/1] rounded-2xl"
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
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Centered Custom Dot Pagination with Progress Animation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center px-2 py-1 space-x-1 bg-neutral-900/50 rounded-full">
          {images.map((_, index) => (
            <div
              key={index}
              className={`relative h-2 rounded-full transition-all duration-200 ${
                index === currentSlide ? "bg-gray-400 w-10" : "bg-gray-400 w-2"
              }`}
            >
              {/* Progress Bar Overlay */}
              {index === currentSlide && (
                <div
                  ref={index === currentSlide ? progressRef : null}
                  className="absolute inset-0 bg-white h-full rounded-full z-10 transition-all duration-[5000ms] ease-linear"
                  style={{ width: "0%" }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {!isMobile &&
        portalContainer &&
        ReactDOM.createPortal(
          <div
            className={`absolute top-1/2 left-20 right-20 flex transform -translate-y-1/2 z-20 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {!isFirstSlide && (
              <button
                onClick={handlePrevClick}
                className="w-12 h-12 ml-14 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-200 transition cursor-pointer"
              >
                <BsChevronLeft />
              </button>
            )}
            <div
              className={`flex-grow ${isFirstSlide ? "ml-18" : ""} ${
                isLastSlide ? "mr-18" : ""
              }`}
            ></div>
            {!isLastSlide && (
              <button
                onClick={handleNextClick}
                className="w-12 h-12 mr-14 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-200 transition cursor-pointer"
              >
                <BsChevronRight />
              </button>
            )}
          </div>,
          portalContainer
        )}
    </div>
  );
};

export default Carousel;
