// components/product-user/ImageCarDetails.jsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { useRouter } from "next/navigation";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import "swiper/css/navigation";
import { FreeMode, Thumbs } from "swiper/modules";
import { useState } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

const ImageCarDetails = ({ images, carName, onImageClick, isMobile }) => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="h-[200px] lg:h-[400px] bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500">
        Gambar tidak tersedia
      </div>
    );
  }

  return (
    <div className="px-2">
      {/* Main Image */}
      <div className="lg:flex-1 relative lg:min-w-0">
        <div className="relative aspect-[16/9] rounded-2xl mb-4 lg:mb-0 transition-all duration-500 ease-in-out overflow-hidden">
          <Swiper
            onSwiper={setMainSwiper}
            spaceBetween={isMobile ? 10 : 0}
            thumbs={{
              swiper:
                thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
            }}
            modules={[FreeMode, Thumbs]}
            className="mySwiper2 rounded-2xl h-full"
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div
                  className={`relative h-full cursor-pointer group`}
                  onClick={() => onImageClick && onImageClick(index)}
                >
                  <Image
                    src={image}
                    alt={`${carName} - ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full z-10 select-none">
            {activeIndex + 1} / {images.length}
          </div>

          <button
            onClick={() => router.back()}
            className="absolute top-3 left-3 bg-white/80 hover:bg-white p-2 rounded-full z-10 shadow cursor-pointer transition"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Thumbnail */}
      <div className=" mt-4 relative overflow-hidden horizontal-gradient-fade">
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={4}
          slidesPerView={isMobile ? 4 : 5}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Thumbs]}
          className="mySwiper rounded-lg"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <button
                type="button"
                className={`relative block w-full h-[55px] lg:h-[80px] cursor-pointer group rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 ${
                  index === activeIndex
                    ? "border-2 border-orange-400"
                    : "border-2 border-transparent"
                }`}
                onClick={() => mainSwiper?.slideTo(index)}
                aria-label={`Lihat gambar ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`${carName} - Thumbnail ${index + 1}`}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></div>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ImageCarDetails;
