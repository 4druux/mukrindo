"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";

// Import Components
import Step1Form from "@/components/product-user/Step1Form";
import Step2Form from "@/components/product-user/Step2Form";
import Step3Form from "@/components/product-user/Step3Form";
import Step4Form from "@/components/product-user/Step4Form";
import Stepper from "@/components/global/Stepper";
import { useProducts } from "@/context/ProductContext";
import { useTradeIn } from "@/context/TradeInContext";

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

const initialFormData = {
  // Step 1
  brand: "",
  model: "",
  variant: "",
  transmission: "",
  color: "",
  year: "",
  stnkExpiry: "",
  travelDistance: "",
  // Step 2
  name: "",
  phoneNumber: PHONE_PREFIX,
  email: "",
  // Step 3
  inspectionLocationType: "showroom",
  showroomAddress: "",
  province: "",
  city: "",
  fullAddress: "",
  inspectionDate: "",
  inspectionTime: "",
  // Step 4
  newCarBrand: "",
  newCarModel: "",
  newCarVariant: "",
  newCarTransmission: "",
  newCarColor: "",
  newCarPriceRange: "",
};

const TradeInCar = ({
  initialBrand = "",
  initialModel = "",
  initialYear = "",
  initialPhoneNumber = "",
}) => {
  const { products, loading: productsLoading } = useProducts();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");
  const { isSubmitting, submitTradeInRequest } = useTradeIn();

  const TradeInCarSteps = [
    { id: 1, label: "Info Mobil" },
    { id: 2, label: "Info Kontak" },
    { id: 3, label: "Lokasi Inspeksi" },
    { id: 4, label: "Mobil Baru" },
  ];

  const [formData, setFormData] = useState({
    ...initialFormData,
    brand: initialBrand || initialFormData.brand,
    model: initialModel || initialFormData.model,
    year: initialYear || initialFormData.year,
    phoneNumber: initialPhoneNumber
      ? formatNumberPhone(initialPhoneNumber, PHONE_PREFIX)
      : initialFormData.phoneNumber,
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

  // Step 3 Refs
  const showroomAddressInputRef = useRef(null);
  const provinceSelectRef = useRef(null);
  const citySelectRef = useRef(null);
  const fullAddressInputRef = useRef(null);
  const inspectionDateInputRef = useRef(null);
  const inspectionTimeInputRef = useRef(null);

  // Step 4 Refs
  const newCarBrandRef = useRef(null);
  const newCarModelRef = useRef(null);
  const newCarVariantRef = useRef(null);
  const newCarTransmissionRef = useRef(null);
  const newCarColorRef = useRef(null);
  const newCarPriceRangeRef = useRef(null);

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

      // Step 3
      showroomAddress: showroomAddressInputRef,
      province: provinceSelectRef,
      city: citySelectRef,
      fullAddress: fullAddressInputRef,
      inspectionDate: inspectionDateInputRef,
      inspectionTime: inspectionTimeInputRef,

      // Step 4
      newCarBrand: newCarBrandRef,
      newCarModel: newCarModelRef,
      newCarVariant: newCarVariantRef,
      newCarTransmission: newCarTransmissionRef,
      newCarColor: newCarColorRef,
      newCarPriceRange: newCarPriceRangeRef,
    }),
    []
  );

  const tradeInTransitions = useMemo(
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

      // Step 4 Transitions
      newCarBrand: {
        target: "newCarModel",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      newCarModel: {
        target: "newCarVariant",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      newCarVariant: {
        target: "newCarTransmission",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      newCarTransmission: {
        target: "newCarColor",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      newCarColor: {
        target: "newCarPriceRange",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
    }),
    []
  );

  const { handleAutoAdvance } = useAutoAdvanceFocus(
    allRefs,
    tradeInTransitions
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
    } else if (
      initialModel &&
      initialModel !== formData.model &&
      initialBrand === formData.brand
    ) {
      setFormData((prev) => ({ ...prev, variant: "" }));
    }
  }, [
    initialBrand,
    initialModel,
    initialYear,
    initialPhoneNumber,
    formData.brand,
    formData.model,
  ]);

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

  const availableProducts = useMemo(() => {
    if (productsLoading || !products) return [];
    return products.filter((p) => p.status === "Tersedia");
  }, [products, productsLoading]);

  // 1. Opsi Merek Mobil Baru
  const availableNewCarBrands = useMemo(() => {
    if (productsLoading) return [];
    const brands = new Set(
      availableProducts.map((p) => p.brand).filter(Boolean)
    );
    return Array.from(brands)
      .sort()
      .map((brand) => ({ value: brand, label: brand }));
  }, [availableProducts, productsLoading]);

  // 2. Opsi Model Mobil Baru (Tergantung Merek)
  const availableNewCarModels = useMemo(() => {
    if (productsLoading || !formData.newCarBrand) return [];
    const models = new Set(
      availableProducts
        .filter((p) => p.brand === formData.newCarBrand && p.model)
        .map((p) => p.model)
    );
    return Array.from(models)
      .sort()
      .map((model) => ({ value: model, label: model }));
  }, [availableProducts, productsLoading, formData.newCarBrand]);

  // 3. Opsi Varian Mobil Baru (Tergantung Merek dan Model)
  const availableNewCarVariants = useMemo(() => {
    if (productsLoading || !formData.newCarBrand || !formData.newCarModel)
      return [];
    const variants = new Set(
      availableProducts
        .filter(
          (p) =>
            p.brand === formData.newCarBrand &&
            p.model === formData.newCarModel &&
            p.variant
        )
        .map((p) => p.variant)
    );
    return Array.from(variants)
      .sort()
      .map((variant) => ({ value: variant, label: variant }));
  }, [
    availableProducts,
    productsLoading,
    formData.newCarBrand,
    formData.newCarModel,
  ]);

  const filteredProductsByBMV = useMemo(() => {
    if (
      !formData.newCarBrand ||
      !formData.newCarModel ||
      !formData.newCarVariant
    ) {
      return [];
    }
    return availableProducts.filter(
      (p) =>
        p.brand === formData.newCarBrand &&
        p.model === formData.newCarModel &&
        p.variant === formData.newCarVariant
    );
  }, [
    availableProducts,
    formData.newCarBrand,
    formData.newCarModel,
    formData.newCarVariant,
  ]);

  // 4. Opsi Transmisi Mobil Baru (Tergantung Merek, Model, Varian)
  const availableNewCarTransmissions = useMemo(() => {
    if (productsLoading || filteredProductsByBMV.length === 0) return [];
    const transmissions = new Set(
      filteredProductsByBMV.map((p) => p.transmission).filter(Boolean)
    );
    return Array.from(transmissions)
      .sort()
      .map((t) => ({ value: t, label: t }));
  }, [productsLoading, filteredProductsByBMV]);

  // 5. Opsi Warna Mobil Baru (Tergantung Merek, Model, Varian, Transmisi)
  const availableNewCarColors = useMemo(() => {
    if (
      productsLoading ||
      !formData.newCarTransmission ||
      filteredProductsByBMV.length === 0
    )
      return [];

    const filteredByBMVT = filteredProductsByBMV.filter(
      (p) => p.transmission === formData.newCarTransmission
    );

    const colors = new Set(
      filteredByBMVT.map((p) => p.carColor).filter(Boolean)
    );

    const colorMap = new Map(
      staticCarColorOptions.map((opt) => [opt.value, opt])
    );

    return Array.from(colors)
      .sort()
      .map((colorName) => {
        const colorOption = colorMap.get(colorName);
        return {
          value: colorName,
          label: colorName,
          hex: colorOption ? colorOption.hex : "#D3D3D3",
        };
      });
  }, [productsLoading, filteredProductsByBMV, formData.newCarTransmission]);

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
      } else if (name === "model") {
        newData.variant = "";
      }

      if (name === "newCarBrand") {
        newData.newCarModel = "";
        newData.newCarVariant = "";
        newData.newCarTransmission = "";
        newData.newCarColor = "";
      } else if (name === "newCarModel") {
        newData.newCarVariant = "";
        newData.newCarTransmission = "";
        newData.newCarColor = "";
      } else if (name === "newCarVariant") {
        newData.newCarTransmission = "";
        newData.newCarColor = "";
      } else if (name === "newCarTransmission") {
        newData.newCarColor = "";
      }

      return newData;
    });
    clearErrorOnChange(name);

    if (wasPreviouslyEmpty && value) {
      handleAutoAdvance(name, value);
    }
  };

  const scrollToFirstError = (newErrors) => {
    const firstErrorKey = Object.keys(newErrors)[0];
    if (firstErrorKey) {
      let errorElement = document.getElementById(firstErrorKey);
      if (!errorElement) {
        const refMap = {
          brand: brandSelectRef,
          model: modelSelectRef,
          variant: variantSelectRef,
          year: yearSelectRef,
          transmission: transmissionSelectRef,
          stnkExpiry: stnkExpiryInputRef,
          color: colorSelectRef,
          travelDistance: travelDistanceInputRef,
          name: null,
          phoneNumber: null,
          email: null,
          showroomAddress: null,
          province: null,
          city: null,
          fullAddress: null,
          inspectionDate: null,
          inspectionTime: null,
          newCarBrand: newCarBrandRef,
          newCarModel: newCarModelRef,
          newCarVariant: newCarVariantRef,
          newCarTransmission: newCarTransmissionRef,
          newCarColor: newCarColorRef,
          newCarPriceRange: newCarPriceRangeRef,
        };
        const errorRef = refMap[firstErrorKey];
        errorElement =
          errorRef?.current?.containerRef?.current || errorRef?.current;
        if (errorElement && typeof errorElement.querySelector === "function") {
          errorElement = errorElement.querySelector(
            'input, button, div[role="button"]'
          );
        }
      }

      if (errorElement && typeof errorElement.scrollIntoView === "function") {
        errorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
        if (typeof errorElement.focus === "function") {
        }
      } else {
        console.warn(
          `Could not find or scroll to element for error key: ${firstErrorKey}`
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
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
    if (
      travelDistanceValue === "" ||
      travelDistanceValue === null ||
      travelDistanceValue === undefined
    )
      newErrors.travelDistance = "Jarak tempuh wajib diisi.";
    else if (Number(travelDistanceValue) < 0)
      newErrors.travelDistance = "Jarak tempuh tidak valid.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) scrollToFirstError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePhoneNumber = (numberValue) => {
    const rawNumber = unformatNumberPhone(numberValue, PHONE_PREFIX);
    if (!rawNumber) return "";
    if (!rawNumber.startsWith("8")) return "Harus diawali angka 8.";
    const minLength = 9;
    const maxLength = 12;
    if (rawNumber.length < minLength || rawNumber.length > maxLength) {
      return `Harus ${minLength}-${maxLength} digit setelah '8'.`;
    }
    return "";
  };

  const validateStep2 = () => {
    const newErrors = {};
    const phoneFormatError = validatePhoneNumber(formData.phoneNumber);
    const rawPhoneNumber = unformatNumberPhone(
      formData.phoneNumber,
      PHONE_PREFIX
    );
    if (!formData.name.trim()) newErrors.name = "Nama wajib diisi.";
    if (!rawPhoneNumber) newErrors.phoneNumber = "No Handphone wajib diisi.";
    else if (phoneFormatError) newErrors.phoneFormat = phoneFormatError;
    if (!formData.email.trim()) newErrors.email = "Email wajib diisi.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Format email tidak valid.";

    const combinedErrors = { ...newErrors };
    if (phoneFormatError) combinedErrors.phoneNumber = phoneFormatError;

    setErrors(combinedErrors);
    if (Object.keys(newErrors).length > 0 || phoneFormatError) {
      scrollToFirstError(combinedErrors);
    }
    return Object.keys(newErrors).length === 0 && !phoneFormatError;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.inspectionLocationType)
      newErrors.inspectionLocationType = "Pilih lokasi inspeksi.";
    else if (formData.inspectionLocationType === "showroom") {
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
      scrollToFirstError(newErrors);
      toast.error("Harap lengkapi informasi lokasi & jadwal inspeksi.", {
        className: "custom-toast",
      });
    }
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    if (!formData.newCarBrand) {
      newErrors.newCarBrand = "Merek mobil baru wajib diisi.";
    }

    if (!formData.newCarModel) {
      newErrors.newCarModel = "Merek mobil baru wajib diisi.";
    }

    if (!formData.newCarVariant) {
      newErrors.newCarVariant = "Varian mobil baru wajib diisi.";
    }

    if (!formData.newCarTransmission) {
      newErrors.newCarTransmission = "Transmisi mobil baru wajib diisi.";
    }

    if (!formData.newCarColor) {
      newErrors.newCarColor = "Warna mobil baru wajib diisi.";
    }

    if (!formData.newCarPriceRange) {
      newErrors.newCarPriceRange = "Rentang harga wajib diisi.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(newErrors);
      toast.error("Harap lengkapi preferensi mobil baru Anda.", {
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
    let isValid = false;
    if (currentStep === 1) {
      isValid = validateStep1();
      if (!isValid)
        toast.error("Harap lengkapi semua informasi mobil lama dengan benar.", {
          className: "custom-toast",
        });
    } else if (currentStep === 2) {
      isValid = validateStep2();
      if (!isValid)
        toast.error("Harap lengkapi informasi kontak Anda dengan benar.", {
          className: "custom-toast",
        });
    } else if (currentStep === 3) {
      isValid = validateStep3();
    }

    if (isValid && currentStep < TradeInCarSteps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (validateStep4()) {
      if (!termsAccepted) {
        const errorMessage =
          "*Silahkan centang Syarat dan ketentuan serta Kebijakan Privasi";
        setTermsError(errorMessage);
        toast.error(errorMessage, { className: "custom-toast" });
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
        // Step 1
        tradeInBrand: formData.brand,
        tradeInModel: formData.model,
        tradeInVariant: formData.variant,
        tradeInYear: formData.year,
        tradeInTransmission: formData.transmission,
        tradeInStnkExpiry: formData.stnkExpiry,
        tradeInColor: formData.color,
        tradeInTravelDistance: unformatNumber(formData.travelDistance),
        //  Step 2
        customerName: formData.name,
        customerPhoneNumber: rawPhoneNumber,
        customerEmail: formData.email,
        // Step 3
        inspectionLocationType: formData.inspectionLocationType,
        inspectionShowroomAddress:
          formData.inspectionLocationType === "showroom"
            ? formData.showroomAddress
            : undefined,
        inspectionProvince:
          formData.inspectionLocationType === "rumah"
            ? formData.province
            : undefined,
        inspectionCity:
          formData.inspectionLocationType === "rumah"
            ? formData.city
            : undefined,
        inspectionFullAddress:
          formData.inspectionLocationType === "rumah"
            ? formData.fullAddress
            : undefined,
        inspectionDate: formData.inspectionDate,
        inspectionTime: formData.inspectionTime,
        // Step 4
        newCarBrandPreference: formData.newCarBrand || undefined,
        newCarModelPreference: formData.newCarModel || undefined,
        newCarVariantPreference: formData.newCarVariant || undefined,
        newCarTransmissionPreference: formData.newCarTransmission || undefined,
        newCarColorPreference: formData.newCarColor || undefined,
        newCarPriceRangePreference: formData.newCarPriceRange || undefined,
      };

      Object.keys(submissionData).forEach((key) => {
        if (submissionData[key] === undefined) {
          delete submissionData[key];
        }
      });

      try {
        const result = await submitTradeInRequest(submissionData);

        if (result.success) {
          console.log("Pengiriman berhasil:", result.data);

          setFormData({ ...initialFormData });
          setCurrentStep(1);
          setTermsAccepted(false);
          setErrors({});
          setTermsError("");
          window.scrollTo(0, 0);
        } else {
          console.error("Pengiriman gagal:", result.error);
        }
      } catch (error) {
        console.error("Error saat memanggil submitTradeInRequest:", error);
        toast.error("Gagal menghubungi server.", { className: "custom-toast" });
      }
    }
  };

  return (
    <div className="container mx-auto -mt-16 lg:-mt-32 relative z-20">
      <div className="bg-white shadow-md p-4 md:p-8 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-auto md:flex-shrink-0 md:pr-4">
            <Stepper currentStep={currentStep} steps={TradeInCarSteps} />
          </div>
          <div className="flex-1 min-w-0">
            {currentStep === 1 && (
              <Step1Form
                currentStep={currentStep}
                totalCarSteps={TradeInCarSteps}
                formData={formData}
                handleChange={handleChange}
                handleSelectChange={handleSelectChange}
                errors={errors}
                onNext={handleNextStep}
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
              />
            )}

            {currentStep === 2 && (
              <Step2Form
                currentStep={currentStep}
                totalCarSteps={TradeInCarSteps}
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                PHONE_PREFIX={PHONE_PREFIX}
              />
            )}

            {currentStep === 3 && (
              <Step3Form
                currentStep={currentStep}
                totalCarSteps={TradeInCarSteps}
                formData={formData}
                handleChange={handleChange}
                handleSelectChange={handleSelectChange}
                errors={errors}
                onNext={handleNextStep}
                onBack={handlePreviousStep}
                isSellRoute={false}
                showroomAddressRef={showroomAddressInputRef}
                provinceRef={provinceSelectRef}
                cityRef={citySelectRef}
                fullAddressRef={fullAddressInputRef}
                inspectionDateRef={inspectionDateInputRef}
                inspectionTimeRef={inspectionTimeInputRef}
              />
            )}

            {currentStep === 4 && (
              <Step4Form
                currentStep={currentStep}
                totalCarSteps={TradeInCarSteps}
                formData={formData}
                handleSelectChange={handleSelectChange}
                errors={errors}
                onSubmit={handleSubmit}
                onBack={handlePreviousStep}
                termsAccepted={termsAccepted}
                termsError={termsError}
                onTermsChange={handleTermsChange}
                brandOptions={availableNewCarBrands}
                modelOptions={availableNewCarModels}
                variantOptions={availableNewCarVariants}
                transmissionOptions={availableNewCarTransmissions}
                colorOptions={availableNewCarColors}
                brandRef={newCarBrandRef}
                modelRef={newCarModelRef}
                variantRef={newCarVariantRef}
                transmissionRef={newCarTransmissionRef}
                colorRef={newCarColorRef}
                priceRangeRef={newCarPriceRangeRef}
                isLoading={productsLoading || isSubmitting}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeInCar;
