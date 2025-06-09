"use client";

import React, { useRef } from "react";
import CarProductCardSwipe from "@/components/product-user/home/CarProductCardSwipe";
import TittleText from "@/components/common/TittleText";
import { motion, AnimatePresence, useInView } from "framer-motion";

const ProductRecommendations = ({ recommendations }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: i * 0.1 },
    }),
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="px-3 md:px-0"
      >
        <TittleText text="Rekomendasi Mobil Serupa" className="mb-2 lg:mb-4" />
      </motion.div>

      <motion.div variants={itemVariants}>
        <AnimatePresence mode="wait">
          <CarProductCardSwipe
            products={recommendations.slice(0, 8)}
            loading={false}
            skeletonCount={8}
            isRecommendation={true}
          />
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ProductRecommendations;
