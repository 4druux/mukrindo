// src/components/Testimoni.jsx
"use client";

import React from "react";
import TestimonialCard from "@/components/common/TestimonialCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/a11y";

// Import Icons for buttons
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

function Testimoni() {
  const testimonials = [
    {
      imgSrc: "/images/carousel/1.jpg",
      rating: 4.5,
      title: "Andi Pratama Tesss",
      description:
        "Layanan yang sangat memuaskan! Timnya responsif dan hasilnya melebihi ekspektasi.",
    },
    {
      imgSrc: "/images/carousel/1.jpg",
      rating: 5,
      title: "Siti Aminah",
      description:
        "Sangat direkomendasikan. Prosesnya mudah dan cepat. Pasti akan menggunakan jasa mereka lagi.",
    },
    {
      imgSrc: "/images/carousel/1.jpg",
      rating: 3,
      title: "Budi Santoso",
      description:
        "Cukup baik, meskipun ada beberapa hal kecil yang bisa ditingkatkan. Secara keseluruhan oke.",
    },
    {
      imgSrc: "/images/carousel/1.jpg",
      rating: 3.5,
      title: "Dewi Lestari",
      description:
        "Pengalaman yang baik, bintang 3.5 karena ada sedikit keterlambatan, tapi kualitas bagus.",
    },
    {
      imgSrc: "/images/carousel/1.jpg",
      rating: 2.8,
      title: "Eko Wijaya",
      description:
        "Ada beberapa area yang perlu perbaikan, tapi potensinya ada. Rating 2.8.",
    },
    {
      imgSrc: "/images/carousel/1.jpg",
      rating: 4,
      title: "Fitri Handayani",
      description: "Pelayanan bagus dan sesuai harapan. Memberikan 4 bintang.",
    },
    {
      imgSrc: "/images/carousel/1.jpg",
      rating: 4,
      title: "Fitri Handayani",
      description: "Pelayanan bagus dan sesuai harapan. Memberikan 4 bintang.",
    },
    {
      imgSrc: "/images/carousel/1.jpg",
      rating: 4,
      title: "Fitri Handayani",
      description: "Pelayanan bagus dan sesuai harapan. Memberikan 4 bintang.",
    },
    {
      imgSrc: "/images/carousel/1.jpg",
      rating: 4,
      title: "Fitri Handayani",
      description: "Pelayanan bagus dan sesuai harapan. Memberikan 4 bintang.",
    },
    {
      imgSrc: "/images/carousel/1.jpg",
      rating: 4,
      title: "Fitri Handayani",
      description: "Pelayanan bagus dan sesuai harapan. Memberikan 4 bintang.",
    },
    {
      imgSrc: "/images/carousel/1.jpg",
      rating: 4,
      title: "Fitri Handayani",
      description: "Pelayanan bagus dan sesuai harapan. Memberikan 4 bintang.",
    },
  ];

  return (
    <div>
      <div className="px-3 lg:px-0">
        <h1 className="text-md lg:text-xl font-medium text-gray-700 mt-6 mb-1">
          Cerita Mereka Bersama Kami
        </h1>
        <p className="text-xs lg:text-sm text-gray-500 mb-2 lg:mb-4 ">
          Lihat pengalaman pelanggan yang puas dengan layanan dan kualitas mobil
          dari Mukrindo Motor. Kami selalu berkomitmen memberikan yang terbaik
          untuk Anda.
        </p>
      </div>

      <div className="w-full relative group horizontal-gradient-fade">
        <Swiper
          modules={[Navigation, A11y]}
          spaceBetween={16}
          slidesPerView={"auto"}
          className="!pb-2 lg:!pb-4 !px-3 lg:!px-0"
          navigation={{
            nextEl: "#testimonial-next",
            prevEl: "#testimonial-prev",
          }}
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide
              key={index}
              className="!h-auto"
              style={{ width: "auto" }}
            >
              <div className="h-full  cursor-grab">
                <TestimonialCard
                  imgSrc={testimonial.imgSrc}
                  rating={testimonial.rating}
                  title={testimonial.title}
                  description={testimonial.description}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="hidden lg:block">
          <button
            id="testimonial-prev"
            className="absolute top-1/2 -left-5 transform -translate-y-1/2 z-10 w-10 h-10 bg-white/50 shadow-md rounded-full flex items-center justify-center hover:bg-white transition-opacity duration-300 cursor-pointer
          opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed"
          >
            <BsChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          <button
            id="testimonial-next"
            className="absolute top-1/2 -right-5 transform -translate-y-1/2 z-10 w-10 h-10 bg-white/50 shadow-md rounded-full flex items-center justify-center hover:bg-white transition-opacity duration-300 cursor-pointer
          opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed"
          >
            <BsChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Testimoni;
