"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import CarImage from "@/components/global/CarImage";
import CarProduct from "@/components/global/CarProduct";
import CarImageModal from "@/components/global/CarImageModal";
import CarPricingInfo from "@/components/product-user/beli-mobil/CarPricingInfo";

const BuyCarDetails = ({ product }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalActiveIndex, setModalActiveIndex] = useState(0);

  const openModal = (index) => {
    setModalActiveIndex(index);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 760);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Beli Mobil", href: "/beli" },
    {
      label: product.brand,
      href: `/beli?search=${encodeURIComponent(product.brand)}`,
    },
    {
      label: product.model,
      href: `/beli?search=${encodeURIComponent(
        `${product.brand} ${product.model}`
      )}`,
    },
    { label: product.carName, href: "" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <BreadcrumbNav items={breadcrumbItems} />
      </motion.div>

      <div className="flex flex-col xl:flex-row gap-4">
        <div className="xl:w-3/5">
          <CarImage
            variants={itemVariants}
            productId={product._id}
            product={product}
            images={product.images}
            isMobile={isMobile}
            onImageClick={openModal}
            isAdminRoute={false}
          />
        </div>

        <div className="w-full xl:w-1/2">
          <CarPricingInfo product={product} variants={itemVariants} />
        </div>
      </div>

      <motion.div variants={itemVariants} className="mt-4 xl:mt-8">
        <CarProduct product={product} isAdminRoute={false} />
      </motion.div>

      <CarImageModal
        show={showModal}
        images={product.images}
        carName={product.carName}
        initialIndex={modalActiveIndex}
        isMobile={isMobile}
        onClose={closeModal}
      />
    </motion.div>
  );
};

export default BuyCarDetails;
