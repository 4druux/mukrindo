// src/components/TradeInBedge.jsx
import FeatureCard from "@/components/common/FeatureCard";
import React from "react";
import { FaTags, FaHandshake } from "react-icons/fa";
import { MdOutlinePublishedWithChanges } from "react-icons/md";

const featuresData = [
  {
    id: 1,
    icon: MdOutlinePublishedWithChanges,
    title: "Proses Cepat",
    description:
      "Segera buat jadwal kunjungan, team kami akan melakukan pengecekan mobil kamu.",
  },
  {
    id: 2,
    icon: FaTags,
    title: "Harga Terbaik",
    description:
      "Dapatkan penawaran harga terbaik untuk mobil Anda setelah proses inspeksi yang transparan.",
  },
  {
    id: 3,
    icon: FaHandshake,
    title: "Aman & Terpercaya",
    description:
      "Proses jual beli mobil dijamin aman, mudah, dan didukung oleh tim profesional kami.",
  },
];

const TradeInBedge = () => {
  return (
    <div className="container mx-auto">
      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 xl:hidden">
        {featuresData.map((feature) => (
          <div key={feature.id} className="w-full">
            <FeatureCard
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              {...(feature.iconColor && { iconColor: feature.iconColor })}
            />
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden xl:block">
        <div className="overflow-hidden relative w-full group whitespace-nowrap horizontal-gradient-fade">
          <div className="flex animate-marquee group-hover:[animation-play-state:paused] will-change-transform">
            {[...featuresData, ...featuresData].map((feature, index) => (
              <div
                key={`${feature.id}-${index}`}
                className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-[32%] p-4 inline-block align-top"
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  {...(feature.iconColor && { iconColor: feature.iconColor })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeInBedge;
