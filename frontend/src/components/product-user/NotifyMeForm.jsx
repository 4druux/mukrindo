// components/product-user/beli-mobil/NotifyMeForm.jsx
"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Select from "@/components/common/Select";
import Input from "@/components/common/Input";
import AnimatedBell from "@/components/animate-icon/AnimatedBell";
import { FaChevronCircleDown } from "react-icons/fa";
import useAutoAdvanceFocus from "@/hooks/useAutoAdvanceFocus";
import axiosInstance from "@/utils/axiosInstance";
import useSWR from "swr";

import {
  formatNumberPhone,
  unformatNumberPhone,
} from "@/utils/formatNumberPhone";
import { useNotification } from "@/context/NotifStockContext";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import TittleText from "../common/TittleText";

const PHONE_PREFIX = "+62 ";
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

  const {
    data: allCarData = [],
    error: carDataError,
    isLoading: isLoadingCarData,
  } = useSWR("/api/car-data/all-data", fetcher);

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

  // Model options
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

  const clearErrorOnChange = (name) => {
    if (errors[name] || (name === "phoneNumber" && errors.phoneFormat)) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        if (name === "phoneNumber") delete newErrors.phoneFormat;
        return newErrors;
      });
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

  const validateForm = (returnErrors = false) => {
    let tempErrors = {};
    const rawPhoneNumber = unformatNumberPhone(
      formData.phoneNumber,
      PHONE_PREFIX
    );

    if (!formData.brand) tempErrors.brand = "Merek wajib dipilih.";
    if (!formData.model) tempErrors.model = "Model wajib dipilih.";
    if (!formData.year) tempErrors.year = "Tahun wajib dipilih.";

    if (!rawPhoneNumber) {
      tempErrors.phoneNumber = "Nomor telepon wajib diisi.";
    } else if (!/^\d{9,13}$/.test(rawPhoneNumber)) {
      tempErrors.phoneFormat = "Format nomor telepon tidak valid (9-13 digit).";
    }

    setErrors(tempErrors);

    if (returnErrors) {
      return tempErrors;
    }
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

    if (validateForm()) {
      const rawPhoneNumber = unformatNumberPhone(
        formData.phoneNumber,
        PHONE_PREFIX
      );
      const submissionData = {
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        phoneNumber: rawPhoneNumber,
      };

      Object.keys(submissionData).forEach((key) => {
        if (submissionData[key] === undefined || submissionData[key] === "") {
          delete submissionData[key];
        }
      });

      console.log("Mengirim Data Notifikasi:", submissionData);

      try {
        const result = await submitNotificationRequest(submissionData);
        if (result.success) {
          console.log("Pengiriman notifikasi berhasil:", result.data);
          setFormData({ ...initialFormData });
          setErrors({});
        } else {
          console.error("Pengiriman notifikasi gagal:", result.error);
        }
      } catch (error) {
        console.error("Error saat memanggil submitNotificationRequest:", error);
        toast.error("Gagal menghubungi server. Silakan coba lagi.", {
          className: "custom-toast",
        });
      }
    } else {
      const currentErrors = validateForm(true);
      console.log("Validation errors:", currentErrors);
      toast.error("Harap lengkapi semua informasi yang diperlukan.", {
        className: "custom-toast",
      });

      if (!isFormExpanded && window.innerWidth < 1024) {
        setIsFormExpanded(true);
        setTimeout(() => scrollToError(currentErrors), 100);
      } else {
        scrollToError(currentErrors);
      }
    }
  };

  const expandForm = () => {
    if (!isFormExpanded) {
      setIsFormExpanded(true);
    }
  };

  const noBrandSelected = !formData.brand;
  const noModelsAvailable = formData.brand && modelOptions.length === 0;

  return (
    <div className="bg-white px-6 pb-6 lg:py-4 xl:py-0 border-y border-gray-200 md:border-none md:rounded-2xl md:shadow-md flex flex-col-reverse lg:flex-row items-center justify-between">
      <div className="w-full lg:w-3/4">
        <div className="flex items-start gap-3">
          <TittleText
            text="Tidak Menemukan Mobil yang Dicari?"
            className="-mt-1"
            separator={false}
          />
          {!isFormExpanded && (
            <div className="lg:hidden text-center">
              <button
                type="button"
                onClick={expandForm}
                className="text-gray-500 hover:text-orange-600 focus:outline-none"
                aria-expanded={isFormExpanded}
                aria-controls="notify-me-collapsible-form"
                aria-label="Tampilkan formulir"
              >
                <FaChevronCircleDown className="w-4 h-4 mx-auto animate-bounce" />
              </button>
            </div>
          )}
        </div>
        <p className="text-xs lg:text-sm text-gray-500 mb-4">
          Beri tahu kami preferensi Anda. Kami akan menghubungi Anda jika mobil
          yang sesuai tersedia.
        </p>
        <form
          id="notify-me-collapsible-form"
          onSubmit={handleSubmit}
          noValidate
          className={`${isFormExpanded ? "block" : "hidden"} lg:block`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
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
                isLoadingCarData || brandOptions.length === 0 || isSubmitting
              }
            />
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
            <Input
              ref={phoneNumberInputRef}
              label="No Handphone"
              id="notifyPhoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder={PHONE_PREFIX}
              error={errors.phoneNumber || errors.phoneFormat}
              inputMode="numeric"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`cursor-pointer flex items-center justify-center w-full bg-gradient-to-br from-red-500 via-orange-400 to-yellow-400 hover:bg-orange-600 hover:from-transparent hover:to-transparent text-white text-sm font-medium py-3 rounded-full group ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
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
            </button>
          </div>
        </form>
      </div>

      <div className="w-full lg:w-1/3 flex justify-center items-center mb-4 lg:mb-0">
        <Image
          src="/images/Badge/customer.png"
          alt="Ilustrasi Kontak - Beritahu Saya"
          width={400}
          height={200}
          className="rounded-lg object-cover max-w-[250px] lg:max-w-full"
          priority
        />
      </div>
    </div>
  );
};

export default NotifyMeForm;
