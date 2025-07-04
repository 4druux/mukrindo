// components/product-user/beli-mobil/NotifyMeForm.jsx
"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Select from "@/components/common/Select";
import Input from "@/components/common/Input";
import AnimatedBell from "@/components/animate-icon/AnimatedBell";
import { FaChevronCircleDown } from "react-icons/fa";
import useAutoAdvanceFocus from "@/hooks/useAutoAdvanceFocus";
import axiosInstance from "@/utils/axiosInstance";
import useSWR from "swr";
import { motion, useInView, AnimatePresence } from "framer-motion";

import {
  formatNumberPhone,
  unformatNumberPhone,
} from "@/utils/formatNumberPhone";
import { useNotification } from "@/context/NotifStockContext";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import TittleText from "@/components/common/TittleText";
import ButtonAction from "@/components/common/ButtonAction";

const PHONE_PREFIX = "(+62) ";
const QUICK_OPEN_DELAY = 50;

const initialFormData = {
  brand: "",
  model: "",
  year: "",
  phoneNumber: PHONE_PREFIX,
};

const fetcher = (url) =>
  axiosInstance.get(url).then((res) => res.data?.data || []);

const NotifyMeForm = () => {
  const [formData, setFormData] = useState({ ...initialFormData });
  const [errors, setErrors] = useState({});
  const { submitNotificationRequest, isSubmitting } = useNotification();
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const {
    data: allCarData = [],
    error: carDataError,
    isLoading: isLoadingCarData,
  } = useSWR("/car-data/all-data", fetcher);

  const brandSelectRef = useRef(null);
  const modelSelectRef = useRef(null);
  const yearSelectRef = useRef(null);
  const phoneNumberInputRef = useRef(null);

  const allRefs = useMemo(
    () => ({
      brand: brandSelectRef,
      model: modelSelectRef,
      year: yearSelectRef,
      phoneNumber: phoneNumberInputRef,
    }),
    []
  );

  const notifyMeTransitions = useMemo(
    () => ({
      brand: {
        target: "model",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      model: {
        target: "year",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      year: { target: "phoneNumber", action: "focus", delay: QUICK_OPEN_DELAY },
    }),
    []
  );

  const { handleAutoAdvance } = useAutoAdvanceFocus(
    allRefs,
    notifyMeTransitions
  );

  const brandOptions = useMemo(
    () =>
      allCarData
        .map((b) => ({
          value: b.brandName,
          label: b.brandName,
          ImgUrl: b.imgUrl || "/images/Carbrand/default.png",
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [allCarData]
  );

  const modelOptions = useMemo(() => {
    if (!formData.brand) return [];
    const selectedBrandData = allCarData.find(
      (b) => b.brandName === formData.brand
    );
    return selectedBrandData?.models
      ? selectedBrandData.models
          .map((m) => ({
            value: m.name,
            label: m.name,
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
      : [];
  }, [formData.brand, allCarData]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 26 }, (_, i) => currentYear - i).map(
    (year) => ({ value: year.toString(), label: year.toString() })
  );

  const validatePhoneNumber = (numberValue) => {
    const rawNumber = unformatNumberPhone(numberValue, PHONE_PREFIX);
    let error = "";
    if (!rawNumber) {
      error = "";
    } else if (!rawNumber.startsWith("8")) {
      error = "Harus diawali angka 8.";
    } else {
      const minLength = 9;
      const maxLength = 12;
      if (rawNumber.length < minLength || rawNumber.length > maxLength) {
        error = `Harus ${minLength}-${maxLength} digit setelah '8'.`;
      }
    }

    setErrors((prev) => ({ ...prev, phoneFormat: error }));
    return error;
  };

  useEffect(() => {
    validatePhoneNumber(formData.phoneNumber);
  }, [formData.phoneNumber]);

  const clearErrorOnChange = (name) => {
    if (errors[name]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === "phoneNumber" && errors.phoneFormat) {
      setErrors((prev) => ({ ...prev, phoneFormat: undefined }));
    }
  };

  const handleSelectChange = (name, value) => {
    const wasPreviouslyEmpty = !formData[name];
    setFormData((prev) => {
      const newData = { ...prev, [name]: value ?? "" };
      if (name === "brand") {
        newData.model = "";
      }
      return newData;
    });
    clearErrorOnChange(name);
    if (wasPreviouslyEmpty && value) {
      handleAutoAdvance(name, value);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === "phoneNumber") {
      const rawValue = unformatNumberPhone(value, PHONE_PREFIX);
      const numericValue = rawValue.replace(/\D/g, "");
      updatedValue = formatNumberPhone(numericValue, PHONE_PREFIX);
    }

    setFormData((prev) => ({ ...prev, [name]: updatedValue ?? "" }));
    clearErrorOnChange(name);
  };

  const validateForm = () => {
    let tempErrors = {};
    const rawPhoneNumber = unformatNumberPhone(
      formData.phoneNumber,
      PHONE_PREFIX
    );

    if (!formData.brand) tempErrors.brand = "Merek wajib dipilih.";
    if (!formData.model) tempErrors.model = "Model wajib dipilih.";
    if (!formData.year) tempErrors.year = "Tahun wajib dipilih.";

    const phoneFormatError = validatePhoneNumber(formData.phoneNumber);

    if (!rawPhoneNumber) {
      tempErrors.phoneNumber = "Nomor telepon wajib diisi.";
    } else if (phoneFormatError) {
      tempErrors.phoneFormat = phoneFormatError;
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const scrollToError = (currentErrors) => {
    let firstErrorKey = null;
    const errorPriority = [
      "brand",
      "model",
      "year",
      "phoneNumber",
      "phoneFormat",
    ];

    for (const key of errorPriority) {
      if (currentErrors[key]) {
        firstErrorKey = key === "phoneFormat" ? "phoneNumber" : key;
        break;
      }
    }

    let elementId = null;
    if (firstErrorKey === "brand") elementId = "notifyBrand";
    else if (firstErrorKey === "model") elementId = "notifyModel";
    else if (firstErrorKey === "year") elementId = "notifyYear";
    else if (firstErrorKey === "phoneNumber") elementId = "notifyPhoneNumber";

    if (elementId) {
      const errorElement = document.getElementById(elementId);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        const focusable = errorElement.querySelector("input, textarea, select");
        if (focusable) {
          focusable.focus({ preventScroll: true });
        } else if (typeof errorElement.focus === "function") {
          errorElement.focus({ preventScroll: true });
        }
      } else {
        console.warn(`Element with id "${elementId}" not found for scrolling.`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (isValid) {
      const rawPhoneNumber = unformatNumberPhone(
        formData.phoneNumber,
        PHONE_PREFIX
      );
      const submissionData = {
        notifStockBrand: formData.brand,
        notifStockModel: formData.model,
        notifStockYear: formData.year,
        customerPhoneNumber: rawPhoneNumber,
      };

      try {
        const result = await submitNotificationRequest(submissionData);
        if (result.success) {
          setFormData({ ...initialFormData });
          setErrors({});
        }
      } catch (error) {
        console.error("Error saat memanggil submitNotificationRequest:", error);
        toast.error("Gagal menghubungi server. Silakan coba lagi.", {
          className: "custom-toast",
        });
      }
    } else {
      toast.error("Harap lengkapi semua informasi dengan benar.", {
        className: "custom-toast",
      });
      if (!isFormExpanded && window.innerWidth < 1024) {
        setIsFormExpanded(true);
        setTimeout(() => scrollToError(errors), 100);
      } else {
        scrollToError(errors);
      }
    }
  };

  const noBrandSelected = !formData.brand;
  const noModelsAvailable = formData.brand && modelOptions.length === 0;

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

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15, delay: 0.2 },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="bg-white px-6 pb-6 lg:py-4 xl:py-0 border-y border-gray-200 md:border-none md:rounded-2xl md:shadow-md flex flex-col-reverse lg:flex-row items-center justify-between"
    >
      <motion.div variants={itemVariants} className="w-full lg:w-3/4">
        <div className="flex items-start gap-3">
          <TittleText
            text="Tidak Menemukan Mobil yang Dicari?"
            className="-mt-1"
            separator={false}
          />

          <div className="lg:hidden text-center">
            <button
              type="button"
              onClick={() => setIsFormExpanded(!isFormExpanded)}
              className="text-gray-500 hover:text-orange-600 focus:outline-none"
              aria-expanded={isFormExpanded}
              aria-controls="notify-me-collapsible-form"
              aria-label={
                isFormExpanded ? "Sembunyikan formulir" : "Tampilkan formulir"
              }
            >
              <motion.div
                animate={{ rotate: isFormExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <FaChevronCircleDown
                  className={`w-4 h-4 mx-auto ${
                    !isFormExpanded ? "animate-bounce" : ""
                  }`}
                />
              </motion.div>
            </button>
          </div>
        </div>

        <p className="text-xs lg:text-sm text-gray-500 mb-4">
          Beri tahu kami preferensi Anda. Kami akan menghubungi Anda jika mobil
          yang sesuai tersedia.
        </p>

        <AnimatePresence>
          <motion.form
            key="notify-form"
            id="notify-me-collapsible-form"
            onSubmit={handleSubmit}
            noValidate
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`${isFormExpanded ? "block" : "hidden"} lg:block`}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
              }}
              initial="hidden"
              animate="visible"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <motion.div variants={itemVariants}>
                  <Select
                    ref={brandSelectRef}
                    label="Merek Mobil"
                    id="notifyBrand"
                    name="brand"
                    title="Pilih Merek"
                    description={
                      brandOptions.length === 0
                        ? "Tidak ada merek tersedia"
                        : "Pilih Merek yang Dicari"
                    }
                    options={brandOptions}
                    value={formData.brand}
                    onChange={(value) => handleSelectChange("brand", value)}
                    error={errors.brand}
                    searchOption={true}
                    disabled={
                      isLoadingCarData ||
                      brandOptions.length === 0 ||
                      isSubmitting
                    }
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Select
                    ref={modelSelectRef}
                    label="Model Mobil"
                    id="notifyModel"
                    name="model"
                    title="Pilih Model"
                    description={
                      noBrandSelected
                        ? "Pilih Merek Terlebih Dahulu!"
                        : noModelsAvailable
                        ? "Tidak ada model tersedia untuk merek ini"
                        : "Pilih Model yang Dicari"
                    }
                    options={modelOptions}
                    value={formData.model}
                    onChange={(value) => handleSelectChange("model", value)}
                    disabled={
                      isLoadingCarData ||
                      noBrandSelected ||
                      noModelsAvailable ||
                      isSubmitting
                    }
                    error={errors.model}
                    searchOption={true}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Select
                    ref={yearSelectRef}
                    label="Tahun"
                    id="notifyYear"
                    name="year"
                    options={years}
                    value={formData.year}
                    onChange={(value) => handleSelectChange("year", value)}
                    title="Pilih Tahun"
                    description="Pilih Tahun Mobil"
                    error={errors.year}
                    disabled={isSubmitting}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Input
                    ref={phoneNumberInputRef}
                    label="No Handphone"
                    id="notifyPhoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    prefix={PHONE_PREFIX}
                    error={errors.phoneNumber || errors.phoneFormat}
                    inputMode="numeric"
                    disabled={isSubmitting}
                  />
                </motion.div>
              </div>

              <motion.div variants={itemVariants}>
                <ButtonAction
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-1 w-5 h-5 animate-spin" />
                  ) : (
                    <AnimatedBell
                      size={20}
                      color="white"
                      className="mr-1 w-5 h-5"
                    />
                  )}
                  <span>{isSubmitting ? "Mengirim..." : "Beritahu Saya"}</span>
                </ButtonAction>
              </motion.div>
            </motion.div>
          </motion.form>
        </AnimatePresence>
      </motion.div>

      <motion.div
        variants={imageVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="w-full lg:w-1/3 flex justify-center items-center mb-4 lg:mb-0"
      >
        <Image
          src="/images/Badge/customer.png"
          alt="Ilustrasi Kontak - Beritahu Saya"
          width={400}
          height={200}
          className="rounded-lg object-cover max-w-[250px] lg:max-w-full"
          priority
        />
      </motion.div>
    </motion.div>
  );
};

export default NotifyMeForm;
