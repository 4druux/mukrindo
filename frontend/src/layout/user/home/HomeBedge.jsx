// layout/user/home/HomeBedge.jsx
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
];

const HomeBedge = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        ease: "easeOut",
        duration: 0.5,
      },
    },
  };

  const textVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { ease: "easeOut", duration: 0.5 },
    },
  };

  return (
    <div ref={ref}>
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={textVariants}
        className="px-3 md:px-0"
      >
        <TittleText
          text="Bosan dengan mobil yang lama?"
          className="mt-6 mb-1"
        />
      </motion.div>

      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={textVariants}
        transition={{ delay: 0.1 }}
        className="px-3 md:px-0"
      >
        <p className="text-xs lg:text-sm text-gray-500 mb-4 lg:mb-6">
          Mau mobil bekas terbaru atau tukar tambah mobil lamamu bisa loh dengan
          pilihan yang beragam dari Mukrindo Motor
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {featuresData.map((feature) => (
          <motion.div key={feature.id} variants={itemVariants}>
            <FeatureCard
              imgSrc={feature.imgSrc}
              title={feature.title}
              description={feature.description}
              linkUrl={feature.linkUrl}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default HomeBedge;
