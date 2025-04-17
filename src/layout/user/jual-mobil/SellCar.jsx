// components/sell-car/SellCar.jsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react"; // Import useRef
import toast from "react-hot-toast";
import {
  formatNumberPhone,
  unformatNumberPhone,
} from "@/utils/formatNumberPhone";
import { formatNumber, unformatNumber } from "@/utils/formatNumber"; // Import formatNumber utils
import carData from "@/utils/carData";
import { FaCheck } from "react-icons/fa";
import Step1Form from "@/components/product-user/jual-mobil/Step1Form";
import Step2Form from "@/components/product-user/jual-mobil/Step2Form";
import Step3Form from "@/components/product-user/jual-mobil/Step3Form"; // Import Step3Form
import { getCityOptions } from "@/utils/locationData";

const PHONE_PREFIX = "(+62) ";

const SellCar = ({
  initialBrand = "",
  initialModel = "",
  initialYear = "",
  initialPhoneNumber = "",
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 fields
    brand: initialBrand,
    model: initialModel,
    variant: "",
    year: initialYear,
    transmission: "",
    stnkExpiry: "",
    color: "",
    travelDistance: "",
    price: "",
    // Step 2 fields
    name: "",
    phoneNumber: initialPhoneNumber
      ? formatNumberPhone(initialPhoneNumber, PHONE_PREFIX)
      : PHONE_PREFIX,
    email: "",
    // Step 3 fields
    inspectionLocationType: "showroom",
    showroomAddress: "",
    province: "",
    city: "",
    fullAddress: "",
    inspectionDate: "",
    inspectionTime: "",
  });
  const [errors, setErrors] = useState({});

  // --- Refs for Auto Focus/Open (Mirip AddProduct) ---
  const brandSelectRef = useRef(null);
  const modelSelectRef = useRef(null);
  const variantSelectRef = useRef(null);
  const yearSelectRef = useRef(null);
  const transmissionSelectRef = useRef(null);
  const stnkExpiryInputRef = useRef(null);
  const colorInputRef = useRef(null);
  const travelDistanceInputRef = useRef(null);
  const priceInputRef = useRef(null);
  const inputTimers = useRef({});
  // --- End Refs ---

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
      carData[formData.brand]?.Model[formData.model]; // Langsung ambil array-nya

    // Pastikan itu benar-benar array sebelum di-map
    if (Array.isArray(variantsArray)) {
      return variantsArray.map((variant) => ({
        value: variant, // Gunakan string variant sebagai value
        label: variant, // Gunakan string variant sebagai label
      }));
    }
    // Jika tidak ada brand/model terpilih atau data tidak ditemukan/bukan array, kembalikan array kosong
    return [];
  }, [formData.brand, formData.model]);
  // --- End Dynamic Options ---

  // --- Clear Error Logic (Mirip AddProduct) ---
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
  // --- End Clear Error Logic ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === "price" || name === "travelDistance") {
      const unformattedNum = unformatNumber(value);
      updatedValue = unformattedNum > 0 ? unformattedNum : "";
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

    if (inputTimers.current[name]) {
      clearTimeout(inputTimers.current[name]);
    }

    if (!value) {
      return;
    }

    const inactivityDelay = 2000;

    // Auto focus logic for Step 1 inputs
    if (name === "stnkExpiry") {
      inputTimers.current[name] = setTimeout(() => {
        colorInputRef.current?.focus();
      }, inactivityDelay);
    } else if (name === "color") {
      inputTimers.current[name] = setTimeout(() => {
        travelDistanceInputRef.current?.focus();
      }, inactivityDelay);
    } else if (name === "travelDistance") {
      inputTimers.current[name] = setTimeout(() => {
        priceInputRef.current?.focus();
      }, inactivityDelay);
    }
    // Note: Auto focus logic for Step 2 inputs (name, phoneNumber, email) bisa ditambahkan di sini jika diperlukan saat di Step 2
  };
  // --- End Modified handleChange ---

  // --- Modified handleSelectChange (Mirip AddProduct) ---
  const handleSelectChange = (name, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Reset dependent fields
      if (name === "brand") {
        newData.model = "";
        newData.variant = "";
      }
      if (name === "model") {
        newData.variant = "";
      }
      return newData;
    });
    clearErrorOnChange(name); // Clear error on change

    // Auto open logic for Step 1 selects
    const quickOpenDelay = 50; // Delay cepat seperti di AddProduct
    if (name === "brand" && value) {
      setTimeout(() => modelSelectRef.current?.openDropdown(), quickOpenDelay);
    } else if (name === "model" && value) {
      setTimeout(
        () => variantSelectRef.current?.openDropdown(),
        quickOpenDelay
      );
    } else if (name === "variant" && value) {
      setTimeout(() => yearSelectRef.current?.openDropdown(), quickOpenDelay);
    } else if (name === "year" && value) {
      setTimeout(
        () => transmissionSelectRef.current?.openDropdown(),
        quickOpenDelay
      );
    } else if (name === "transmission" && value) {
      // Fokus ke input STNK setelah memilih transmisi
      setTimeout(() => stnkExpiryInputRef.current?.focus(), quickOpenDelay);
    }
  };
  // --- End Modified handleSelectChange ---

  // --- useEffect for Timer Cleanup (Mirip AddProduct) ---
  useEffect(() => {
    return () => {
      Object.values(inputTimers.current).forEach(clearTimeout);
    };
  }, []);
  // --- End useEffect ---

  // ... (Fungsi validatePhoneNumber, validateStep1, validateStep2, handleNextStep, handlePreviousStep, handleSubmit tetap sama) ...
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
    return ""; // Valid
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
    // Scroll to first error (Mirip AddProduct)
    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorElement = document.getElementById(firstErrorKey); // Pastikan input/select punya id yang sesuai
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
    // Scroll to first error (Mirip AddProduct)
    if (
      Object.keys(newErrors).filter((key) => key !== "phoneFormat").length >
        0 ||
      phoneFormatError
    ) {
      const firstErrorKey = Object.keys(newErrors).find(
        (key) => newErrors[key]
      );
      if (firstErrorKey) {
        const errorElement = document.getElementById(firstErrorKey); // Pastikan input punya id yang sesuai
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

    // Validasi field umum (tanggal & jam) hanya jika lokasi sudah dipilih
    if (formData.inspectionLocationType) {
      if (!formData.inspectionDate)
        newErrors.inspectionDate = "Tanggal inspeksi wajib diisi.";
      if (!formData.inspectionTime)
        newErrors.inspectionTime = "Jam inspeksi wajib diisi.";
    }

    setErrors(newErrors);
    // Scroll to first error
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
        setCurrentStep(3); // Lanjut ke Step 3
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
    if (validateStep3()) {
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

      // Hapus properti undefined jika ada
      Object.keys(submissionData).forEach((key) => {
        if (submissionData[key] === undefined) {
          delete submissionData[key];
        }
      });

      console.log("Data Siap Dikirim:", submissionData);
      toast.success("Permintaan Anda sedang diproses!");
    }
  };

  // ... (renderStepper tetap sama) ...
  const renderStepper = () => (
    <div className="h-full flex flex-col justify-between relative">
      {/* Step 1 */}
      <div className="z-10 bg-white pb-2 flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            currentStep >= 1
              ? "bg-orange-600 text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          {currentStep > 1 ? <FaCheck size={16} /> : "1"}
        </div>
        <span
          className={`ml-2 text-sm font-medium ${
            currentStep >= 1 ? "text-gray-700" : "text-gray-500"
          }`}
        >
          Info Mobil
        </span>
      </div>
      {/* Connector 1-2 */}
      <div
        className="absolute top-4 left-4 h-[calc(50%-1rem)] border-l-2 border-dashed z-0
          border-orange-600"
      ></div>{" "}
      {/* Selalu orange setelah step 1 */}
      {/* Step 2 */}
      <div className="z-10 bg-white py-2 flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            currentStep >= 2
              ? "bg-orange-600 text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          {currentStep > 2 ? <FaCheck size={16} /> : "2"}
        </div>
        <span
          className={`ml-2 text-sm font-medium ${
            currentStep >= 2 ? "text-gray-700" : "text-gray-500"
          }`}
        >
          Info Kontak
        </span>
      </div>
      {/* Connector 2-3 */}
      <div
        className={`absolute top-1/2 left-4 h-[calc(50%-1rem)] border-l-2 border-dashed z-0 ${
          currentStep > 2 ? "border-orange-600" : "border-gray-300"
        }`}
      ></div>
      {/* Step 3 */}
      <div className="z-10 bg-white pt-2 flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            currentStep >= 3
              ? "bg-orange-600 text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          3
        </div>
        <span
          className={`ml-2 text-sm font-medium ${
            currentStep >= 3 ? "text-gray-700" : "text-gray-500"
          }`}
        >
          Lokasi Inspeksi
        </span>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto -mt-10 md:-mt-16 lg:-mt-20 relative z-20 px-4 md:px-0">
      <div className="bg-white shadow-lg p-4 md:p-8 rounded-xl md:rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/8 flex-shrink-0">{renderStepper()}</div>
          {/* Form di kanan */}
          <div className="flex-1 min-w-0">
            {currentStep === 1 && (
              <Step1Form
                formData={formData}
                handleChange={handleChange}
                handleSelectChange={handleSelectChange}
                errors={errors}
                onNext={handleNextStep} // Tetap onNext
                brandOptions={brandOptions}
                modelOptions={modelOptions}
                variantOptions={variantOptions}
                formatNumber={formatNumber}
                brandRef={brandSelectRef}
                modelRef={modelSelectRef}
                variantRef={variantSelectRef}
                yearRef={yearSelectRef}
                transmissionRef={transmissionSelectRef}
                stnkExpiryRef={stnkExpiryInputRef}
                colorRef={colorInputRef}
                travelDistanceRef={travelDistanceInputRef}
                priceRef={priceInputRef}
              />
            )}
            {currentStep === 2 && (
              <Step2Form
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                onSubmit={handleNextStep} // Tombol di Step 2 sekarang memanggil handleNextStep
                onBack={handlePreviousStep}
                PHONE_PREFIX={PHONE_PREFIX}
              />
            )}
            {currentStep === 3 && ( // Render Step3Form
              <Step3Form
                formData={formData}
                handleChange={handleChange}
                handleSelectChange={handleSelectChange}
                errors={errors}
                onSubmit={handleSubmit} // Tombol di Step 3 memanggil handleSubmit
                onBack={handlePreviousStep}
                // Tidak perlu pass cityOptions jika dihitung di dalam Step3Form
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellCar;
