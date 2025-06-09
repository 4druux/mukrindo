// src/components/global/CarProduct.jsx
import React from "react";
import { motion } from "framer-motion";

// Import Icon
import { BsFuelPumpFill } from "react-icons/bs";
import { GiGearStickPattern } from "react-icons/gi";
import { FaRoad } from "react-icons/fa";
import { MdOutlineColorLens } from "react-icons/md";
import { CheckCircle, FileCheck, XCircle } from "lucide-react";

const CarProduct = ({ product, isAdminRoute = false }) => {
  if (!product) {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  };

  const formatNumber = (number) => {
    return number.toLocaleString("id-ID");
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className={`bg-white md:rounded-3xl md:shadow-md overflow-hidden ${
        isAdminRoute
          ? "border-t-4 border-orange-500 lg:border-none rounded-t-3xl"
          : "border-y border-gray-300 md:border-none"
      }`}
    >
      <div className="p-5 lg:p-8">
        <motion.div
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200"
          >
            <h1 className="text-md lg:text-lg font-medium text-gray-700">
              Spesifikasi Kendaraan
            </h1>
            <div className={`${isAdminRoute ? "block" : "hidden"}`}>
              <div
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs lg:text-sm font-semibold ${
                  product.status === "Terjual"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {product.status === "Terjual" ? (
                  <XCircle className="w-4 h-4 mr-1.5" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                )}
                {product.status}
              </div>
            </div>
          </motion.div>

          <div
            className={`flex flex-col gap-y-5 mb-4 pb-4 ${
              isAdminRoute
                ? "lg:grid lg:grid-cols-4"
                : "lg:flex-row lg:items-center lg:justify-between"
            }`}
          >
            {/* Kilometer */}
            <motion.div
              variants={itemVariants}
              className="flex items-center space-x-3"
            >
              <FaRoad className="text-gray-700 w-6 h-6 lg:w-7 lg:h-7 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Kilometer
                </p>
                <span className="text-gray-900 font-medium text-sm lg:text-base">
                  {formatNumber(product.travelDistance)} KM
                </span>
              </div>
            </motion.div>

            {/* Transmisi */}
            <motion.div
              variants={itemVariants}
              className="flex items-center space-x-3"
            >
              <GiGearStickPattern className="text-gray-700 w-6 h-6 lg:w-7 lg:h-7 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Transmisi
                </p>
                <span className="text-gray-900 font-medium text-sm lg:text-base">
                  {product.transmission}
                </span>
              </div>
            </motion.div>

            {/* Bahan Bakar */}
            <motion.div
              variants={itemVariants}
              className="flex items-center space-x-3"
            >
              <BsFuelPumpFill className="text-gray-700 w-6 h-6 lg:w-7 lg:h-7 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Bahan Bakar
                </p>
                <span className="text-gray-900 font-medium text-sm lg:text-base">
                  {product.fuelType}
                </span>
              </div>
            </motion.div>

            {/* Warna */}
            <motion.div
              variants={itemVariants}
              className="flex items-center space-x-3"
            >
              <MdOutlineColorLens className="text-gray-700 w-6 h-6 lg:w-7 lg:h-7 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Warna
                </p>
                <span className="text-gray-900 font-medium text-sm lg:text-base">
                  {product.carColor}
                </span>
              </div>
            </motion.div>

            {/* STNK Expiry */}
            <motion.div
              variants={itemVariants}
              className="flex items-center space-x-3"
            >
              <FileCheck className="text-gray-700 w-6 h-6 lg:w-7 lg:h-7 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  STNK Berlaku s/d
                </p>
                <span className="text-gray-900 font-medium text-sm lg:text-base">
                  {formatDate(product.stnkExpiry)}
                </span>
              </div>
            </motion.div>
          </div>

          <motion.h2
            variants={itemVariants}
            className="text-md lg:text-lg font-medium text-gray-700  mb-5 border-b border-gray-200 pb-2"
          >
            Detail Spesifikasi
          </motion.h2>

          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-y-4 ${
              isAdminRoute ? "lg:gap-x-8" : "lg:gap-x-16 "
            }`}
          >
            <motion.div variants={itemVariants} className="space-y-4">
              {/* Merk */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <p className="text-sm text-gray-600">Merk</p>
                <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                  {product.brand}
                </span>
              </div>

              {/* Model */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <p className="text-sm text-gray-600">Model</p>
                <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                  {product.model}
                </span>
              </div>

              {/* Variant */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <p className="text-sm text-gray-600">Variant</p>
                <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                  {product.variant}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <p className="text-sm text-gray-600">Tipe Bodi</p>
                <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                  {product.type}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <p className="text-sm text-gray-600">Kapasitas Tempat Duduk</p>
                <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                  {product.numberOfSeats} Kursi
                </span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              {/* Kapasitas Mesin */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <p className="text-sm text-gray-600">Kapasitas Mesin</p>
                <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                  {product.cc} CC
                </span>
              </div>
              {/* Transmisi */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <p className="text-sm text-gray-600">Transmisi</p>
                <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                  {product.transmission}
                </span>
              </div>
              {/* Sistem Penggerak */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <p className="text-sm text-gray-600">Sistem Penggerak</p>
                <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                  {product.driveSystem}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <p className="text-sm text-gray-600">Plat Nomor</p>
                <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                  {product.plateNumber}
                </span>
              </div>

              {/* Tahun Perakitan */}
              <div className="flex justify-between items-center lg:border-b lg:border-gray-100 lg:pb-2">
                <p className="text-sm text-gray-600">Tahun Perakitan</p>
                <span className="text-sm lg:text-base font-medium text-gray-900 text-right">
                  {product.yearOfAssembly}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CarProduct;
