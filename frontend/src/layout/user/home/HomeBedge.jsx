//layout/user/jual-mobil/HomeBedge.jsx
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import FeatureCard from "@/components/common/FeatureCard";
import TittleText from "@/components/common/TittleText";

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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 14 },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <motion.div variants={itemVariants} className="px-3 md:px-0">
        <TittleText
          text="Bosan dengan mobil yang lama?"
          className="mt-6 mb-1"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="px-3 md:px-0">
        <p className="text-xs lg:text-sm text-gray-500 mb-4 lg:mb-6">
          Mau mobil bekas terbaru atau tukar tambah mobil lamamu bisa loh dengan
          pilihan yang beragam dari Mukrindo Motor
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featuresData.map((feature) => (
          <FeatureCard
            key={feature.id}
            imgSrc={feature.imgSrc}
            variants={itemVariants}
            title={feature.title}
            description={feature.description}
            linkUrl={feature.linkUrl}
            {...(feature.iconColor && { iconColor: feature.iconColor })}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default HomeBedge;
