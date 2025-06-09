// components/sell-car/Step3Form.jsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import {
  showroomOptions,
  timeSlotOptions,
  provinceOptions,
  getCityOptions,
} from "@/utils/locationData";
import { MapPin } from "lucide-react";
import ButtonMagnetic from "../common/ButtonMagnetic";
import ButtonAction from "../common/ButtonAction";

const Step3Form = ({
  formData,
  handleChange,
  handleSelectChange,
  errors,
  onSubmit,
  onNext,
  onBack,
  currentStep,
  totalCarSteps,
  isSellRoute = false,
  termsAccepted,
  termsError,
  onTermsChange,
  showroomAddressRef,
  provinceRef,
  cityRef,
  fullAddressRef,
  inspectionDateRef,
  inspectionTimeRef,
}) => {
  const handleLocationTypeChange = (e) => {
    const { name, value } = e.target;
    const resetFields = {
      showroomAddress: "",
      province: "",
      city: "",
      fullAddress: "",
    };
    handleChange({ target: { name, value } });

    Object.keys(resetFields).forEach((fieldName) => {
      if (
        ["showroomAddress", "province", "city", "inspectionTime"].includes(
          fieldName
        )
      ) {
        handleSelectChange(fieldName, resetFields[fieldName]);
      } else if (fieldName === "fullAddress") {
        handleChange({
          target: { name: fieldName, value: resetFields[fieldName] },
        });
      }
    });

    handleSelectChange("city", "");
  };

  const cityOptions = useMemo(() => {
    return getCityOptions(formData.province);
  }, [formData.province]);

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
          Lokasi & Jadwal Inspeksi
        </h2>
        <p className="text-sm text-gray-700 mb-6">
          Selesaikan {currentStep} dari {totalCarSteps.length} langkah dan pilih
          lokasi dan jadwal yang paling nyaman untukmu.
        </p>
      </motion.div>

      {/* Pilihan Lokasi Inspeksi */}
      <motion.div variants={itemVariants} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lokasi Inspeksi
        </label>
        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="inspectionLocationType"
              value="showroom"
              checked={formData.inspectionLocationType === "showroom"}
              onChange={handleLocationTypeChange}
              className="form-radio h-4 w-4 accent-orange-600"
            />

            <span className="text-xs lg:text-sm  font-medium text-gray-700">
              Showroom Mukrindo Motor
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="inspectionLocationType"
              value="rumah"
              checked={formData.inspectionLocationType === "rumah"}
              onChange={handleLocationTypeChange}
              className="form-radio h-4 w-4 accent-orange-600"
            />
            <span className="text-xs lg:text-sm font-medium text-gray-700">
              Rumah
            </span>
          </label>
        </div>

        {formData.inspectionLocationType === "showroom" && (
          <>
            <div className="mt-2">
              <a
                href="https://maps.app.goo.gl/Yzri7iGL8dZb1W8z6"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-500 hover:text-orange-600 hover:underline inline-flex items-center cursor-pointer"
              >
                <MapPin size={12} className="mr-1" />
                Lihat Peta Lokasi
              </a>
            </div>
          </>
        )}

        {errors.inspectionLocationType && (
          <p className="mt-1 text-xs text-red-600">
            {errors.inspectionLocationType}
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {formData.inspectionLocationType === "showroom" && (
          <>
            <motion.div variants={itemVariants}>
              <Select
                ref={showroomAddressRef}
                label="Alamat Showroom"
                id="showroomAddress"
                name="showroomAddress"
                title="Alamat Showroom"
                description="showroom Mukrindo Motor"
                options={showroomOptions}
                value={formData.showroomAddress}
                onChange={(value) =>
                  handleSelectChange("showroomAddress", value)
                }
                error={errors.showroomAddress}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                ref={inspectionDateRef}
                label="Tanggal Inspeksi"
                id="inspectionDate"
                type="date"
                name="inspectionDate"
                value={formData.inspectionDate}
                onChange={handleChange}
                error={errors.inspectionDate}
                min={new Date().toISOString().split("T")[0]}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Select
                ref={inspectionTimeRef}
                label="Jam Inspeksi"
                id="inspectionTime"
                name="inspectionTime"
                title="Pilih Jam Inspeksi"
                description="Pilih slot waktu inspeksi"
                options={timeSlotOptions}
                value={formData.inspectionTime}
                onChange={(value) =>
                  handleSelectChange("inspectionTime", value)
                }
                error={errors.inspectionTime}
              />
            </motion.div>
          </>
        )}

        {formData.inspectionLocationType === "rumah" && (
          <>
            <motion.div variants={itemVariants}>
              <Select
                ref={provinceRef}
                label="Provinsi"
                id="province"
                name="province"
                title="Pilih Provinsi"
                description="Pilih provinsi alamat Anda"
                options={provinceOptions}
                value={formData.province}
                onChange={(value) => {
                  handleSelectChange("province", value);
                  handleSelectChange("city", "");
                }}
                error={errors.province}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Select
                ref={cityRef}
                label="Kota/Kabupaten"
                id="city"
                name="city"
                title="Pilih Kota/Kabupaten"
                description={
                  formData.province
                    ? "Pilih kota/kabupaten Anda"
                    : "Pilih provinsi terlebih dahulu"
                }
                options={cityOptions}
                value={formData.city}
                onChange={(value) => handleSelectChange("city", value)}
                disabled={!formData.province || cityOptions.length === 0}
                error={errors.city}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Input
                ref={inspectionDateRef}
                label="Tanggal Inspeksi"
                id="inspectionDate"
                type="date"
                name="inspectionDate"
                value={formData.inspectionDate}
                onChange={handleChange}
                error={errors.inspectionDate}
                min={new Date().toISOString().split("T")[0]}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Select
                ref={inspectionTimeRef}
                label="Jam Inspeksi"
                id="inspectionTime"
                name="inspectionTime"
                title="Pilih Jam Inspeksi"
                description="Pilih slot waktu inspeksi"
                options={timeSlotOptions}
                value={formData.inspectionTime}
                onChange={(value) =>
                  handleSelectChange("inspectionTime", value)
                }
                error={errors.inspectionTime}
              />
            </motion.div>

            <div className="md:col-span-2">
              <motion.div variants={itemVariants}>
                <Input
                  ref={fullAddressRef}
                  label="Alamat Lengkap Rumah"
                  id="fullAddress"
                  name="fullAddress"
                  value={formData.fullAddress}
                  onChange={handleChange}
                  placeholder="Contoh: Jl. Merdeka No. 10, RT 01/RW 02, Kelurahan, Kecamatan"
                  error={errors.fullAddress}
                />
              </motion.div>
            </div>
          </>
        )}
      </div>

      <motion.div
        variants={itemVariants}
        className={` mt-4 ${
          isSellRoute
            ? "flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-0 lg:items-center"
            : ""
        }`}
      >
        {isSellRoute && (
          <div className="">
            <label
              id="terms-checkbox-label"
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                name="termsAccepted"
                checked={termsAccepted}
                onChange={onTermsChange}
                className="form-checkbox h-4 w-4 accent-orange-600 rounded border-gray-300 cursor-pointer"
              />
              <span className="text-xs text-gray-700">
                Saya setuju dengan{" "}
                <a
                  href="/syarat-ketentuan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline font-medium"
                >
                  Syarat dan Ketentuan
                </a>{" "}
                serta{" "}
                <a
                  href="/kebijakan-privasi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline font-medium"
                >
                  Kebijakan Privasi
                </a>{" "}
                dari Mukrindo Motor
              </span>
            </label>
            {termsError && (
              <p className="mt-1 ml-5 text-[10px] text-red-600">{termsError}</p>
            )}
          </div>
        )}
        {/* Tombol Navigasi */}
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
          <ButtonMagnetic
            type="button"
            onClick={onBack}
            className="!py-2.5 !m-0"
          >
            Kembali
          </ButtonMagnetic>
          <ButtonAction type="button" onClick={isSellRoute ? onSubmit : onNext}>
            {isSellRoute ? "Jual Sekarang" : "Selanjutnya"}
          </ButtonAction>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Step3Form;
