// components/sell-car/Step1Form.jsx
import React from "react";
import { motion } from "framer-motion";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import ButtonAction from "../common/ButtonAction";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 26 }, (_, i) => currentYear - i).map(
  (year) => ({
    value: year.toString(),
    label: year.toString(),
  })
);

const Step1Form = ({
  formData,
  handleChange,
  handleSelectChange,
  errors,
  onNext,
  currentStep,
  totalCarSteps,
  brandOptions,
  modelOptions,
  variantOptions,
  formatNumber,
  colorOptions,
  brandRef,
  modelRef,
  variantRef,
  yearRef,
  transmissionRef,
  stnkExpiryRef,
  colorRef,
  travelDistanceRef,
  priceRef,
  isSellRoute = false,
  isLoadingOptions,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
    },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-medium text-gray-700 mb-1">
          Informasi Mobil Kamu
        </h2>
        <p className="text-sm text-gray-700 mb-6">
          Selesaikan {currentStep} dari {totalCarSteps.length} langkah dan
          lengkapi detail mobil {isSellRoute ? "yang ingin kamu jual" : "anda"}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div variants={itemVariants}>
          <Select
            ref={brandRef}
            label="Merek Mobil"
            id="brand"
            name="brand"
            title="Pilih Merek"
            description="Pilih Merek Mobil Anda"
            options={brandOptions}
            value={formData.brand}
            onChange={(value) => handleSelectChange("brand", value)}
            error={errors.brand}
            searchOption={true}
            disabled={isLoadingOptions}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Select
            ref={modelRef}
            id="model"
            label="Model Mobil"
            name="model"
            title="Pilih Model"
            description={
              formData.brand
                ? "Pilih Model Mobil"
                : "Pilih Merek Mobil Terlebih Dahulu!"
            }
            options={modelOptions}
            value={formData.model}
            onChange={(value) => handleSelectChange("model", value)}
            disabled={isLoadingOptions || !formData.brand}
            error={errors.model}
            searchOption={true}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Select
            ref={variantRef}
            id="variant"
            label="Varian Mobil"
            name="variant"
            title="Pilih Varian"
            description={
              formData.model
                ? "Pilih Varian Mobil"
                : "Pilih Model Mobil Terlebih Dahulu!"
            }
            options={variantOptions}
            value={formData.variant}
            onChange={(value) => handleSelectChange("variant", value)}
            disabled={
              isLoadingOptions || !formData.model || variantOptions.length === 0
            }
            error={errors.variant}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Select
            ref={transmissionRef}
            id="transmission"
            label="Transmisi"
            name="transmission"
            title="Pilih Transmisi"
            description="Pilih Transmisi Mobil Anda"
            options={[
              { value: "Automatic", label: "Automatic" },
              { value: "Manual", label: "Manual" },
              { value: "CVT", label: "CVT" },
            ]}
            value={formData.transmission}
            onChange={(value) => handleSelectChange("transmission", value)}
            error={errors.transmission}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Select
            ref={colorRef}
            label="Warna Mobil"
            id="color"
            name="color"
            title="Pilih Warna"
            description="Pilih warna mobil Anda saat ini"
            options={colorOptions}
            value={formData.color}
            onChange={(value) => handleSelectChange("color", value)}
            error={errors.color}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Select
            ref={yearRef}
            label="Tahun"
            id="year"
            name="year"
            options={years}
            value={formData.year}
            onChange={(value) => handleSelectChange("year", value)}
            title="Pilih Tahun"
            description="Pilih Tahun Mobil Anda"
            disabled={!formData.variant}
            error={errors.year}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Input
            ref={stnkExpiryRef}
            label="Masa Berlaku STNK"
            id="stnkExpiry"
            type="date"
            name="stnkExpiry"
            value={formData.stnkExpiry}
            onChange={handleChange}
            error={errors.stnkExpiry}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Input
            ref={travelDistanceRef}
            label="Jarak Tempuh (KM)"
            id="travelDistance"
            name="travelDistance"
            inputMode="numeric"
            placeholderTexts={["50.000", "120.000", "200.000", "300.000"]}
            value={formData.travelDistance}
            onChange={handleChange}
            formatter={formatNumber}
            error={errors.travelDistance}
          />
        </motion.div>

        {isSellRoute && (
          <>
            <motion.div variants={itemVariants}>
              <Input
                ref={priceRef}
                label="Harga Mobil"
                id="price"
                name="price"
                inputMode="numeric"
                value={formData.price}
                onChange={handleChange}
                formatter={formatNumber}
                error={errors.price}
                prefix="Rp "
              />
            </motion.div>
          </>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
          delay: 0.6,
        }}
        className="flex justify-end mt-4"
      >
        <ButtonAction type="button" onClick={onNext}>
          Selanjutnya
        </ButtonAction>
      </motion.div>
    </motion.div>
  );
};

export default Step1Form;
