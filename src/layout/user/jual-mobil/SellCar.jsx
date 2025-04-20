"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";

// Import Components
import Step1Form from "@/components/product-user/Step1Form";
import Step2Form from "@/components/product-user/Step2Form";
import Step3Form from "@/components/product-user/Step3Form";
import Stepper from "@/components/global/Stepper";

// Import Utils
import {
  formatNumberPhone,
  unformatNumberPhone,
} from "@/utils/formatNumberPhone";
import { carColorOptions as staticCarColorOptions } from "@/utils/carColorOptions";
import { formatNumber, unformatNumber } from "@/utils/formatNumber";
import carData from "@/utils/carData";

// Import Hooks
import useAutoAdvanceFocus from "@/hooks/useAutoAdvanceFocus";

const PHONE_PREFIX = "(+62) ";
const QUICK_OPEN_DELAY = 50;
const INACTIVITY_DELAY = 10000;

const SellCar = ({
  initialBrand = "",
  initialModel = "",
  initialYear = "",
  initialPhoneNumber = "",
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");

  const sellCarSteps = [
    { id: 1, label: "Info Mobil" },
    { id: 2, label: "Info Kontak" },
    { id: 3, label: "Lokasi Inspeksi" },
  ];

  const [formData, setFormData] = useState({
    // Step 1
    brand: initialBrand,
    model: initialModel,
    variant: "",
    transmission: "",
    color: "",
    year: initialYear,
    stnkExpiry: "",
    travelDistance: "",
    price: "",

    // Step 2
    name: "",
    phoneNumber: initialPhoneNumber
      ? formatNumberPhone(initialPhoneNumber, PHONE_PREFIX)
      : PHONE_PREFIX,
    email: "",

    // Step 3
    inspectionLocationType: "showroom",
    showroomAddress: "",
    province: "",
    city: "",
    fullAddress: "",
    inspectionDate: "",
    inspectionTime: "",
  });

  // Step 1 Refs
  const brandSelectRef = useRef(null);
  const modelSelectRef = useRef(null);
  const variantSelectRef = useRef(null);
  const transmissionSelectRef = useRef(null);
  const colorSelectRef = useRef(null);
  const yearSelectRef = useRef(null);
  const stnkExpiryInputRef = useRef(null);
  const travelDistanceInputRef = useRef(null);
  const priceInputRef = useRef(null);

  // Step 3 Refs
  const showroomAddressInputRef = useRef(null);
  const provinceSelectRef = useRef(null);
  const citySelectRef = useRef(null);
  const fullAddressInputRef = useRef(null);
  const inspectionDateInputRef = useRef(null);
  const inspectionTimeInputRef = useRef(null);

  const allRefs = useMemo(
    () => ({
      // Step 1
      brand: brandSelectRef,
      model: modelSelectRef,
      variant: variantSelectRef,
      transmission: transmissionSelectRef,
      color: colorSelectRef,
      year: yearSelectRef,
      stnkExpiry: stnkExpiryInputRef,
      travelDistance: travelDistanceInputRef,
      price: priceInputRef,

      // Step 3
      showroomAddress: showroomAddressInputRef,
      province: provinceSelectRef,
      city: citySelectRef,
      fullAddress: fullAddressInputRef,
      inspectionDate: inspectionDateInputRef,
      inspectionTime: inspectionTimeInputRef,
    }),
    []
  );

  const sellCarTransitions = useMemo(
    () => ({
      // Step 1 Transitions
      brand: {
        target: "model",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      model: {
        target: "variant",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      variant: {
        target: "transmission",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      transmission: {
        target: "color",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      color: {
        target: "year",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      year: {
        target: "stnkExpiry",
        action: "focus",
        delay: QUICK_OPEN_DELAY,
      },
      stnkExpiry: {
        target: "travelDistance",
        action: "focus",
        delay: QUICK_OPEN_DELAY,
      },
      travelDistance: {
        target: "price",
        action: "focus",
        delay: INACTIVITY_DELAY,
        type: "inactivity",
      },

      // Step 3 Transitions
      showroomAddress: {
        target: "inspectionDate",
        action: "focus",
        delay: QUICK_OPEN_DELAY,
      },
      province: {
        target: "city",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      city: {
        target: "inspectionDate",
        action: "focus",
        delay: QUICK_OPEN_DELAY,
      },
      inspectionDate: {
        target: "inspectionTime",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      inspectionTime: {
        target: "fullAddress",
        action: "focus",
        delay: QUICK_OPEN_DELAY,
      },
    }),
    []
  );

  const { handleAutoAdvance } = useAutoAdvanceFocus(
    allRefs,
    sellCarTransitions
  );

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      brand: initialBrand || prev.brand,
      model: initialModel || prev.model,
      year: initialYear || prev.year,
      phoneNumber: initialPhoneNumber
        ? formatNumberPhone(initialPhoneNumber, PHONE_PREFIX)
        : prev.phoneNumber !== PHONE_PREFIX
        ? prev.phoneNumber
        : PHONE_PREFIX,
    }));

    if (initialBrand && initialBrand !== formData.brand) {
      setFormData((prev) => ({
        ...prev,
        model: initialModel || "",
        variant: "",
      }));
    }
  }, [initialBrand, initialModel, initialYear, initialPhoneNumber]);

  const brandOptions = useMemo(
    () =>
      Object.keys(carData).map((brand) => ({
        value: brand,
        label: brand,
      })),
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

  const variantOptions = useMemo(() => {
    const variantsArray =
      formData.brand &&
      formData.model &&
      carData[formData.brand]?.Model[formData.model];

    if (Array.isArray(variantsArray)) {
      return variantsArray.map((variant) => ({
        value: variant,
        label: variant,
      }));
    }
    return [];
  }, [formData.brand, formData.model]);

  // Clear Error
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

  // Handle Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    const wasPreviouslyEmpty = !formData[name];
    let updatedValue = value;

    if (name === "price" || name === "travelDistance") {
      const unformattedNum = unformatNumber(value);
      updatedValue = unformattedNum >= 0 ? unformattedNum.toString() : "";
    } else if (name === "phoneNumber") {
      const rawValue = unformatNumberPhone(value, PHONE_PREFIX);
      const numericValue = rawValue.replace(/\D/g, "");
      updatedValue = formatNumberPhone(numericValue, PHONE_PREFIX);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue ?? "",
    }));
    clearErrorOnChange(name);

    if (wasPreviouslyEmpty && updatedValue) {
      handleAutoAdvance(name, updatedValue);
    }
  };

  // Handle Select
  const handleSelectChange = (name, value) => {
    const wasPreviouslyEmpty = !formData[name];
    setFormData((prev) => {
      const newData = { ...prev, [name]: value ?? "" };
      if (name === "brand") {
        newData.model = "";
        newData.variant = "";
      }
      if (name === "model") {
        newData.variant = "";
      }
      return newData;
    });
    clearErrorOnChange(name);

    if (wasPreviouslyEmpty && value) {
      handleAutoAdvance(name, value);
    }
  };

  const validatePhoneNumber = (numberValue) => {
    const rawNumber = unformatNumberPhone(numberValue, PHONE_PREFIX);
    if (!rawNumber) return "";

    if (!rawNumber.startsWith("8")) {
      return "Harus diawali angka 8.";
    }
    const minLength = 9;
    const maxLength = 12;
    if (rawNumber.length < minLength || rawNumber.length > maxLength) {
      return `Harus ${minLength}-${maxLength} digit setelah '8'.`;
    }
    return "";
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.brand) newErrors.brand = "Merek wajib diisi.";
    if (!formData.model) newErrors.model = "Model wajib diisi.";
    if (!formData.variant) newErrors.variant = "Varian wajib diisi.";
    if (!formData.year) newErrors.year = "Tahun wajib diisi.";
    if (!formData.transmission)
      newErrors.transmission = "Transmisi wajib diisi.";
    if (!formData.stnkExpiry)
      newErrors.stnkExpiry = "Tanggal STNK wajib diisi.";
    if (!formData.color) newErrors.color = "Warna wajib diisi.";

    const travelDistanceValue = formData.travelDistance;
    if (travelDistanceValue === "") {
      newErrors.travelDistance = "Jarak tempuh wajib diisi.";
    } else if (Number(travelDistanceValue) < 0) {
      newErrors.travelDistance = "Jarak tempuh tidak valid.";
    }

    const priceValue = formData.price;
    if (priceValue === "") {
      newErrors.price = "Harga wajib diisi.";
    } else if (Number(priceValue) <= 0) {
      newErrors.price = "Harga tidak valid.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorElement = document.getElementById(firstErrorKey);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const phoneFormatError = validatePhoneNumber(formData.phoneNumber);
    const rawPhoneNumber = unformatNumberPhone(
      formData.phoneNumber,
      PHONE_PREFIX
    );

    if (!formData.name) newErrors.name = "Nama wajib diisi.";
    if (!rawPhoneNumber) newErrors.phoneNumber = "No Handphone wajib diisi.";
    else if (phoneFormatError) newErrors.phoneFormat = phoneFormatError;
    if (!formData.email) newErrors.email = "Email wajib diisi.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Format email tidak valid.";

    setErrors(newErrors);
    if (
      Object.keys(newErrors).filter((key) => key !== "phoneFormat").length >
        0 ||
      phoneFormatError
    ) {
      const firstErrorKey = Object.keys(newErrors).find(
        (key) => newErrors[key]
      );
      if (firstErrorKey) {
        const errorElement = document.getElementById(firstErrorKey);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
    return (
      Object.keys(newErrors).filter((key) => key !== "phoneFormat").length ===
        0 && !phoneFormatError
    );
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.inspectionLocationType) {
      newErrors.inspectionLocationType = "Pilih lokasi inspeksi.";
    } else if (formData.inspectionLocationType === "showroom") {
      if (!formData.showroomAddress)
        newErrors.showroomAddress = "Pilih alamat showroom.";
    } else if (formData.inspectionLocationType === "rumah") {
      if (!formData.province) newErrors.province = "Provinsi wajib diisi.";
      if (!formData.city) newErrors.city = "Kota/Kabupaten wajib diisi.";
      if (!formData.fullAddress.trim())
        newErrors.fullAddress = "Alamat lengkap wajib diisi.";
    }

    if (formData.inspectionLocationType) {
      if (!formData.inspectionDate)
        newErrors.inspectionDate = "Tanggal inspeksi wajib diisi.";
      if (!formData.inspectionTime)
        newErrors.inspectionTime = "Jam inspeksi wajib diisi.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorElement = document.getElementById(firstErrorKey);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      toast.error("Harap lengkapi informasi lokasi & jadwal inspeksi.", {
        className: "custom-toast",
      });
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleTermsChange = (e) => {
    setTermsAccepted(e.target.checked);
    if (termsError) {
      setTermsError("");
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
        window.scrollTo(0, 0);
      } else {
        toast.error("Harap lengkapi semua informasi mobil dengan benar.", {
          className: "custom-toast",
        });
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
        window.scrollTo(0, 0);
      } else {
        toast.error("Harap lengkapi informasi kontak Anda dengan benar.", {
          className: "custom-toast",
        });
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = () => {
    setTermsError("");
    if (validateStep3()) {
      if (!termsAccepted) {
        const errorMessage =
          "*Silahkan centang Syarat dan ketentuan serta Kebijakan Privasi";
        setTermsError(errorMessage);
        const errorElement = document.getElementById("terms-checkbox-label");
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      const rawPhoneNumber = unformatNumberPhone(
        formData.phoneNumber,
        PHONE_PREFIX
      );
      const submissionData = {
        ...formData,
        phoneNumber: rawPhoneNumber,
        travelDistance: unformatNumber(formData.travelDistance),
        price: unformatNumber(formData.price),
        ...(formData.inspectionLocationType === "showroom" && {
          province: undefined,
          city: undefined,
          fullAddress: undefined,
        }),
        ...(formData.inspectionLocationType === "rumah" && {
          showroomAddress: undefined,
        }),
      };

      Object.keys(submissionData).forEach((key) => {
        if (submissionData[key] === undefined) {
          delete submissionData[key];
        }
      });

      console.log("Data Siap Dikirim:", submissionData);
      toast.success("Permintaan Anda akan diproses!", {
        className: "custom-toast",
      });
    }
  };

  return (
    <div className="container mx-auto -mt-10 md:-mt-16 lg:-mt-20 relative pb-20 z-20 px-4 md:px-0">
      <div className="bg-white shadow-lg p-4 md:p-8 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-auto md:flex-shrink-0 md:pr-4">
            <Stepper currentStep={currentStep} steps={sellCarSteps} />
          </div>
          <div className="flex-1 min-w-0">
            {currentStep === 1 && (
              <Step1Form
                formData={formData}
                handleChange={handleChange}
                handleSelectChange={handleSelectChange}
                errors={errors}
                onNext={handleNextStep}
                isSellRoute={true}
                brandOptions={brandOptions}
                modelOptions={modelOptions}
                variantOptions={variantOptions}
                formatNumber={formatNumber}
                colorOptions={staticCarColorOptions}
                brandRef={brandSelectRef}
                modelRef={modelSelectRef}
                variantRef={variantSelectRef}
                yearRef={yearSelectRef}
                transmissionRef={transmissionSelectRef}
                stnkExpiryRef={stnkExpiryInputRef}
                colorRef={colorSelectRef}
                travelDistanceRef={travelDistanceInputRef}
                priceRef={priceInputRef}
                currentStep={currentStep}
                totalCarSteps={sellCarSteps}
              />
            )}

            {currentStep === 2 && (
              <Step2Form
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                PHONE_PREFIX={PHONE_PREFIX}
                currentStep={currentStep}
                totalCarSteps={sellCarSteps}
              />
            )}

            {currentStep === 3 && (
              <Step3Form
                formData={formData}
                handleChange={handleChange}
                handleSelectChange={handleSelectChange}
                errors={errors}
                onSubmit={handleSubmit}
                onBack={handlePreviousStep}
                isSellRoute={true}
                termsAccepted={termsAccepted}
                termsError={termsError}
                onTermsChange={handleTermsChange}
                currentStep={currentStep}
                totalCarSteps={sellCarSteps}
                showroomAddressRef={showroomAddressInputRef}
                provinceRef={provinceSelectRef}
                cityRef={citySelectRef}
                fullAddressRef={fullAddressInputRef}
                inspectionDateRef={inspectionDateInputRef}
                inspectionTimeRef={inspectionTimeInputRef}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellCar;
