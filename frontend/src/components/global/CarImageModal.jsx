// components/CarImageModal.js
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

// Import Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import "swiper/css/navigation";
import { FreeMode, Thumbs, Navigation } from "swiper/modules";

// Import Icon
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const CarImageModal = ({
  show,
  images,
  carName,
  initialIndex,
  isMobile,
  onClose,
}) => {
  const [modalActiveIndex, setModalActiveIndex] = useState(initialIndex);
  const [thumbsSwiperModal, setThumbsSwiperModal] = useState(null);

  useEffect(() => {
    setModalActiveIndex(initialIndex);
  }, [initialIndex, show]);

  useEffect(() => {
    if (thumbsSwiperModal && !thumbsSwiperModal.destroyed) {
      thumbsSwiperModal.slideTo(modalActiveIndex);
    }
  }, [modalActiveIndex, thumbsSwiperModal]);

  if (!show || !images || images.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative group rounded-none md:rounded-4xl min-w-sm px-2 md:max-w-4xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-3 top-1 md:right-5 md:top-4 bg-white/80 hover:bg-white rounded-full p-2 z-20 cursor-pointer group/close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>

        <Swiper
          initialSlide={initialIndex}
          spaceBetween={isMobile ? 10 : 0}
          navigation={{
            nextEl: ".modal-swiper-button-next",
            prevEl: ".modal-swiper-button-prev",
          }}
          thumbs={{
            swiper:
              thumbsSwiperModal && !thumbsSwiperModal.destroyed
                ? thumbsSwiperModal
                : null,
          }}
          modules={[FreeMode, Thumbs, Navigation]}
          className="mySwiper2Modal rounded-none lg:rounded-2xl"
          onSlideChange={(swiper) => setModalActiveIndex(swiper.activeIndex)}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src={image}
                  alt={`${carName} - ${index + 1}`}
                  layout="fill"
                  className="object-cover md:object-cover cursor-grab"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="hidden lg:block">
          <button
            className="modal-swiper-button-prev absolute top-1/2 -mt-14 left-4 transform -translate-y-1/2 bg-black/30 
          hover:bg-black/50 disabled:hidden rounded-full p-2 z-10 opacity-0 group-hover:opacity-100 
           transition-opacity duration-300 ease-in-out cursor-pointer"
            aria-label="Previous image"
          >
            <BsChevronLeft className="lg:w-6 lg:h-6 text-gray-300 group-hover:text-gray-100" />
          </button>
          <button
            className="modal-swiper-button-next absolute top-1/2 -mt-14 right-4 transform -translate-y-1/2 bg-black/30 
          hover:bg-black/50 disabled:hidden rounded-full p-2 z-10 opacity-0 group-hover:opacity-100 
           transition-opacity duration-300 ease-in-out cursor-pointer"
            aria-label="Next image"
          >
            <BsChevronRight className="lg:w-6 lg:h-6 text-gray-300 group-hover:text-gray-100" />
          </button>
        </div>

        <div className="flex justify-between items-center px-2 mt-2">
          <p className="text-sm font-medium text-white">Semua gambar</p>
          <div className="bg-black/30 text-white text-xs px-3 py-2 rounded-full z-10">
            {modalActiveIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail Modal */}
        <Swiper
          onSwiper={setThumbsSwiperModal}
          spaceBetween={isMobile ? 4 : 10}
          slidesPerView={isMobile ? 4 : 5}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Thumbs]}
          className="mySwiperModalThumbs rounded-md mt-4"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div
                className={`relative w-full h-[50px] md:h-[90px] cursor-pointer ${
                  modalActiveIndex === index
                    ? "border-b-3 md:border-b-4 border-orange-500"
                    : "border border-transparent"
                }`}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default CarImageModal;
