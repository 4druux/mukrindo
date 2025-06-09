// components/sell-car/Step2Form.jsx
import React from "react";
import { motion } from "framer-motion";
import Input from "@/components/common/Input";
import ButtonMagnetic from "../common/ButtonMagnetic";
import ButtonAction from "../common/ButtonAction";

const Step2Form = ({
  formData,
  handleChange,
  errors,
  onNext,
  onBack,
  PHONE_PREFIX,
  currentStep,
  totalCarSteps,
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
          Informasi Kontak Kamu
        </h2>
        <p className="text-sm text-gray-700 mb-6">
          Selesaikan {currentStep} dari {totalCarSteps.length} langkah dan kami
          akan menghubungimu berdasarkan informasi ini.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.div variants={itemVariants}>
          <Input
            label="Nama Lengkap"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nama Lengkap Sesuai STNK"
            error={errors.name}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Input
            label="No Handphone"
            name="phoneNumber"
            type="tel"
            prefix={PHONE_PREFIX}
            value={formData.phoneNumber}
            onChange={handleChange}
            error={errors.phoneNumber || errors.phoneFormat}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Input
            label="Alamat Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="contoh@email.com"
            error={errors.email}
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
          delay: 0.6,
        }}
        className="flex justify-end gap-x-2 sm:gap-x-4 mt-4"
      >
        <ButtonMagnetic type="button" onClick={onBack} className="!py-2.5 !m-0">
          Kembali
        </ButtonMagnetic>

        <ButtonAction type="button" onClick={onNext}>
          Selanjutnya
        </ButtonAction>
      </motion.div>
    </motion.div>
  );
};

export default Step2Form;
