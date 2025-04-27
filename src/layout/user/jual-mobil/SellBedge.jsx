//layout/user/jual-mobil/SellBedge.jsx
import FeatureCard from "@/components/common/FeatureCard";
import React from "react";
import { FaCalendarCheck, FaMoneyBillWave, FaShieldAlt } from "react-icons/fa";

const featuresData = [
  {
    id: 1,
    icon: FaCalendarCheck,
    title: "Proses Cepat",
    description:
      "Jadwalkan inspeksi online sekarang, tim kami segera datang mengecek mobil Anda.",
  },
  {
    id: 2,
    icon: FaMoneyBillWave,
    title: "Harga Terbaik",
    description:
      "Dapatkan penawaran harga terbaik untuk mobil Anda setelah proses inspeksi yang transparan.",
  },
  {
    id: 3,
    icon: FaShieldAlt,
    title: "Aman & Terpercaya",
    description:
      "Proses jual beli mobil dijamin aman, mudah, dan didukung oleh tim profesional kami.",
  },
];

const SellBedge = () => {
  return (
    <div className="container mx-auto py-8">
      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
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
      <div className="hidden lg:block">
        <div className="overflow-hidden relative w-full group whitespace-nowrap horizontal-gradient-fade">
          <div className="flex animate-marquee group-hover:[animation-play-state:paused] will-change-transform">
            {[...featuresData, ...featuresData].map((feature, index) => (
              <div
                key={`${feature.id}-${index}`}
                className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-[32%] p-4  inline-block align-top"
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

export default SellBedge;
