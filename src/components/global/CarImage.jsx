// export in CarProductCard, CarDetails (admin), CarDetails (user)

// components/global/CarImage.jsx
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Import Component
import { useHeader } from "@/context/HeaderContext";
import { useProducts } from "@/context/ProductContext";
import ShareProduct from "../product-user/beli-mobil/ShareProduct";

// Import Swiper
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import "swiper/css/navigation";
import { FreeMode, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Icon
import { ArrowLeft, Heart } from "lucide-react";

const CarImage = ({
  productId,
  images,
  carName,
  onImageClick,
  isMobile,
  isAdminRoute = false,
}) => {
  const { toggleBookmarkSidebar } = useHeader();
  const { bookmarkCount, toggleBookmark, isBookmarked } = useProducts();
  const [isSticky, setIsSticky] = useState(false);
  const isStickyMobile = window.innerWidth <= 768;
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const liked = isBookmarked(productId);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500">
        Gambar tidak tersedia
      </div>
    );
  }

  useEffect(() => {
    const handleScroll = () => {
      const shouldBeSticky =
        window.scrollY > 100 && isStickyMobile && !isAdminRoute;
      if (shouldBeSticky !== isSticky) {
        setIsSticky(shouldBeSticky);
      } else if ((!isStickyMobile || isAdminRoute) && isSticky) {
        setIsSticky(false);
      }
    };

    if (!isAdminRoute) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      if (isSticky) setIsSticky(false);
    }
  }, [isAdminRoute, isStickyMobile, isSticky]);

  return (
    <div className="">
      {/* Main Image */}
      <div className="lg:flex-1 relative lg:min-w-0">
        <div className="relative aspect-[16/9] rounded-none lg:rounded-2xl transition-all duration-500 ease-in-out overflow-hidden">
          <Swiper
            onSwiper={setMainSwiper}
            spaceBetween={0}
            thumbs={{
              swiper:
                thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
            }}
            modules={[FreeMode, Thumbs]}
            className="mySwiper2 rounded-none lg:rounded-2xl h-full"
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

          {/* Tombol Kembali admin*/}
          {isAdminRoute && (
            <button
              onClick={() => router.back()}
              className="absolute top-2 lg:top-4 left-1 lg:left-2 z-10 cursor-pointer transition"
              aria-label="Kembali"
            >
              <div className="relative group">
                <div className="bg-white/80 hover:bg-white p-2 rounded-full shadow transition">
                  <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5 text-gray-700" />
                </div>
                <span
                  className="absolute left-1/2 ml-1 -translate-x-1/2 top-full mt-2
                   whitespace-nowrap rounded-lg bg-black/50 px-2 py-1 text-xs text-white
                   opacity-0 group-hover:opacity-100 transition-opacity duration-300
                   invisible group-hover:visible
                   pointer-events-none z-20"
                >
                  Kembali
                </span>
              </div>
            </button>
          )}

          {!isAdminRoute && (
            <>
              {/*  Desktop & Mobile non-sticky */}
              <div
                className={`
                  ${
                    isStickyMobile && isSticky
                      ? "opacity-0 pointer-events-none"
                      : "opacity-100"
                  }
                  transition-opacity duration-300
                `}
              >
                <div className="absolute top-2 lg:top-4 left-1 lg:left-2 z-10">
                  <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} aria-label="Kembali">
                      <div className="relative group">
                        <div className="bg-white/80 hover:bg-white p-2 rounded-full shadow cursor-pointer ">
                          <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5 text-gray-700" />
                        </div>
                        <span
                          className="absolute left-1/2 ml-1 -translate-x-1/2 top-full mt-2
                           whitespace-nowrap rounded-lg bg-black/50 px-2 py-1 text-xs text-white
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300
                           invisible group-hover:visible
                           pointer-events-none z-20"
                        >
                          Kembali
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Kontrol Kanan (Share & Bookmark) */}
                <div className="absolute top-2 lg:top-4 right-3 z-10 cursor-pointer transition">
                  <div className="flex items-center gap-3">
                    <ShareProduct
                      title={`Lihat mobil ini: ${carName}`}
                      isMobile={isMobile}
                      buttonClass={`
                        ${
                          isStickyMobile && isSticky
                            ? ""
                            : "bg-white/80 hover:bg-white cursor-pointer"
                        }
                        p-2 rounded-full shadow transition
                      `}
                      iconClass="w-4 h-4 lg:w-5 lg:h-5 text-gray-700"
                    />

                    {/* Bookmark Desktop */}
                    <div
                      className="relative group cursor-pointer hidden lg:block"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(productId);
                      }}
                    >
                      <div className="bg-white/80 hover:bg-white p-2 rounded-full shadow transition">
                        <Heart
                          className={`w-4 h-4 lg:w-5 lg:h-5 ${
                            liked
                              ? "text-red-500 fill-red-500"
                              : "text-gray-700 fill-none"
                          }`}
                        />
                      </div>
                      <span
                        className="absolute left-3 -translate-x-1/2 top-full mt-2
                         whitespace-nowrap rounded-lg bg-black/50 px-2 py-1 text-xs text-white
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300
                         invisible group-hover:visible
                         pointer-events-none z-20"
                      >
                        Bookmark
                      </span>
                    </div>

                    <div className="block lg:hidden">
                      <button
                        onClick={toggleBookmarkSidebar}
                        className="relative bg-white/80 hover:bg-white p-2 rounded-full shadow"
                        aria-label="Buka Bookmark"
                      >
                        <Heart className="w-4 h-4 text-gray-700 cursor-pointer" />
                        {bookmarkCount > -1 && (
                          <span className="absolute -top-1 -right-1 flex items-center justify-center w-3 h-3 p-2 text-[10px] text-white bg-red-500 rounded-full group-hover:animate-bounce transition-all duration-300 ease-in-out">
                            {bookmarkCount}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile & Sticky */}
              <div
                className={`
                  fixed top-0 left-0 right-0 z-20 bg-white shadow-md px-3 py-2
                  flex items-center justify-between lg:hidden
                  transition-transform duration-300 ease-in-out
                  ${
                    isStickyMobile && isSticky
                      ? "translate-y-0"
                      : "-translate-y-full"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <button onClick={() => router.back()} aria-label="Kembali">
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">
                    {carName}
                  </p>
                </div>

                <div className="flex items-center gap-3 pl-3">
                  <ShareProduct
                    title={`Lihat mobil ini: ${carName}`}
                    isMobile={isMobile}
                    buttonClass="p-2 rounded-full hover:bg-gray-100"
                    iconClass="w-4.5 h-4.5 text-gray-700"
                  />
                  <button
                    onClick={toggleBookmarkSidebar}
                    className="relative p-2"
                    aria-label="Buka Bookmark"
                  >
                    <Heart className="w-5 h-5 text-gray-700" />
                    {bookmarkCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                        {bookmarkCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Indikator Slide */}
          <div
            className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full select-none"
            style={{ zIndex: "1" }}
          >
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="mt-1 lg:mt-4 px-1 relative overflow-hidden horizontal-gradient-fade">
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
                className={`relative block w-full h-[55px] cursor-pointer group rounded-md overflow-hidden ${
                  index === activeIndex
                    ? "border-2 border-orange-400"
                    : "border-2 border-transparent"
                } ${isAdminRoute ? "lg:h-[72px]" : "lg:h-[85px]"}`}
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
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default CarImage;
