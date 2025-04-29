//layout/user/jual-mobil/HomeBedge.jsx
import FeatureCard from "@/components/common/FeatureCard";
import React from "react";

const featuresData = [
  {
    id: 1,
    imgSrc: "/images/Badge/car-1.jpg",
    title: "Beli Mobil Sekarang",
    description:
      "Dapatkan mobil terbaru dan berkualitas dengan harga terbaik dari kami.",
    linkUrl: "/beli",
  },
  {
    id: 2,
    imgSrc: "/images/Badge/car-2.jpg",
    title: "Jual Mobil Sekarang",
    description:
      "Jual mobil Anda dan dapatkan penawaran harga terbaik untuk mobil Anda setelah proses inspeksi yang transparan.",
    linkUrl: "/jual-mobil",
  },

  {
    id: 3,
    imgSrc: "/images/Badge/car-3.jpg",
    title: "Tukar Tambah Mobil Sekarang",
    description:
      "Dapatkan penawaran harga terbaik untuk mobil Anda setelah proses inspeksi yang transparan.",
    linkUrl: "/tukar-tambah",
  },

  {
    id: 4,
    imgSrc: "/images/Badge/budget.jpg",
    title: "Simulasi Budget",
    description:
      "Simulasikan budget Anda untuk memilih mobil yang sesuai dengan kebutuhan Anda.",
    linkUrl: "/simulasi-budget",
  },
];

const HomeBedge = () => {
  return (
    <div>
      <h1 className="text-md lg:text-xl font-medium text-gray-700 mt-6 mb-1 px-3 lg:px-0">
        Bosan dengan mobil yang lama?
      </h1>
      <p className="text-xs lg:text-sm text-gray-500 mb-2 lg:mb-4 px-3 lg:px-0">
        Mau mobil bekas terbaru atau tukar tambah mobil lamamu bisa loh dengan
        pilihan yang beragam dari Mukrindo Motor
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {featuresData.map((feature) => (
          <div key={feature.id} className="w-full">
            <FeatureCard
              imgSrc={feature.imgSrc}
              title={feature.title}
              description={feature.description}
              linkUrl={feature.linkUrl}
              {...(feature.iconColor && { iconColor: feature.iconColor })}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeBedge;
