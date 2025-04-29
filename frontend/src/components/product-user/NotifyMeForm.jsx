"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Select from "@/components/common/Select";
import Input from "@/components/common/Input";
import { IoMdNotifications } from "react-icons/io";
import useAutoAdvanceFocus from "@/hooks/useAutoAdvanceFocus";
import carData from "@/utils/carData";
import {
  formatNumberPhone,
  unformatNumberPhone,
} from "@/utils/formatNumberPhone";
// import toast from "react-hot-toast"; // Uncomment if using toast notifications

const PHONE_PREFIX = "+62 ";
const QUICK_OPEN_DELAY = 50;

const NotifyMeForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    phoneNumber: PHONE_PREFIX,
  });

  const [errors, setErrors] = useState({});

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
    () => Object.keys(carData).map((brand) => ({ value: brand, label: brand })),
    []
  );

  const modelOptions = useMemo(() => {
    return formData.brand && carData[formData.brand]?.Model
      ? Object.keys(carData[formData.brand].Model).map((model) => ({
          value: model,
          label: model,
        }))
      : [];
  }, [formData.brand]);

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
      if (name === "brand") newData.model = "";
      return newData;
    });
    clearErrorOnChange(name);
    if (wasPreviouslyEmpty && value) handleAutoAdvance(name, value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const wasPreviouslyEmpty =
      !formData[name] || formData[name] === PHONE_PREFIX;
    let updatedValue = value;

    if (name === "phoneNumber") {
      const rawValue = unformatNumberPhone(value, PHONE_PREFIX);
      const numericValue = rawValue.replace(/\D/g, "");
      updatedValue = formatNumberPhone(numericValue, PHONE_PREFIX);
    }

    setFormData((prev) => ({ ...prev, [name]: updatedValue ?? "" }));
    clearErrorOnChange(name);

    if (name !== "phoneNumber" && wasPreviouslyEmpty && updatedValue) {
      // No auto-advance from phone number in this form
    }
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

    return (
      !tempErrors.brand &&
      !tempErrors.year &&
      !tempErrors.phoneNumber &&
      !tempErrors.phoneFormat &&
      !(formData.brand && currentModelOptions.length > 0 && !formData.model)
    );
  };

  const handleSubmit = (e) => {
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
      if (onSubmit) {
        onSubmit(submissionData);
        // setFormData({ brand: "", model: "", year: "", phoneNumber: PHONE_PREFIX });
        // setErrors({});
      }
    } else {
      const currentErrors = validateForm(true);
      console.log("Validation errors:", currentErrors);

      let firstErrorKey = null;
      let elementId = null;

      if (currentErrors.brand) {
        firstErrorKey = "brand";
        elementId = "notifyBrand";
      } else if (currentErrors.model) {
        firstErrorKey = "model";
        elementId = "notifyModel";
      } else if (currentErrors.year) {
        firstErrorKey = "year";
        elementId = "year";
      } else if (currentErrors.phoneNumber || currentErrors.phoneFormat) {
        firstErrorKey = "phoneNumber";
        elementId = "phoneNumber"; // Ensure Input has id="phoneNumber"
      }

      if (elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          // Optional: Show toast notification
          // toast.error("Harap lengkapi semua informasi yang diperlukan.", {
          //   className: "custom-toast",
          // });
        } else {
          // Optional: Show toast notification even if element not found
          // toast.error("Harap lengkapi semua informasi yang diperlukan.", {
          //   className: "custom-toast",
          // });
          console.warn(
            `Element with id "${elementId}" not found for scrolling.`
          );
        }
      } else {
        // Optional: Fallback toast notification
        // toast.error("Terjadi kesalahan validasi. Mohon periksa kembali isian Anda.", {
        //   className: "custom-toast",
        // });
      }
    }
  };

  const noBrandSelected = !formData.brand;
  const noModelsAvailable = formData.brand && modelOptions.length === 0;

  return (
    <div className="bg-white px-6 pb-6 lg:py-2 border-y border-gray-200 lg:border-none lg:rounded-2xl lg:shadow-md flex flex-col-reverse lg:flex-row items-center justify-between">
      <div className="w-full lg:w-3/4">
        <h2 className="text-md lg:text-xl font-medium text-gray-700 mb-1">
          Tidak Menemukan Mobil yang Dicari?
        </h2>
        <p className="text-xs lg:text-sm text-gray-500 mb-6">
          Beri tahu kami preferensi Anda. Kami akan menghubungi Anda jika mobil
          yang sesuai tersedia.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              disabled={brandOptions.length === 0}
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
              disabled={noBrandSelected || noModelsAvailable}
              error={errors.model}
              searchOption={true}
            />
            <Select
              ref={yearSelectRef}
              label="Tahun"
              id="year"
              name="year"
              options={years}
              value={formData.year}
              onChange={(value) => handleSelectChange("year", value)}
              title="Pilih Tahun"
              description="Pilih Tahun Mobil"
              error={errors.year}
            />
            <Input
              ref={phoneNumberInputRef}
              label="No Handphone"
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder={PHONE_PREFIX}
              error={errors.phoneNumber || errors.phoneFormat}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>

          <div>
            <button
              type="submit"
              className={`cursor-pointer bg-orange-600 flex items-center justify-center w-full hover:bg-orange-500 text-white text-sm font-medium py-3 rounded-full focus:outline-none focus:shadow-outline group`}
            >
              <IoMdNotifications className="mr-1 w-5 h-5 group-hover:animate-bounce" />
              <span>Beritahu Saya</span>
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
          className="rounded-lg object-cover"
          priority
        />
      </div>
    </div>
  );
};

export default NotifyMeForm;
