"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import {
  formatNumberPhone,
  unformatNumberPhone,
} from "@/utils/formatNumberPhone";
import { formatNumber, unformatNumber } from "@/utils/formatNumber";
import Step1Form from "@/components/product-user/Step1Form";
import Step2Form from "@/components/product-user/Step2Form";
import Step3Form from "@/components/product-user/Step3Form";
import Step4Form from "@/components/product-user/Step4Form";
import Stepper from "@/components/global/Stepper";
import carData from "@/utils/carData";
import { useProducts } from "@/context/ProductContext";
import { carColorOptions as staticCarColorOptions } from "@/utils/carColorOptions";

const PHONE_PREFIX = "(+62) ";

const TradeInCar = ({
  initialBrand = "",
  initialModel = "",
  initialYear = "",
  initialPhoneNumber = "",
}) => {
  const { products, loading: productsLoading } = useProducts();
  const [currentStep, setCurrentStep] = useState(1);
  const TradeInCarSteps = [
    { id: 1, label: "Info Mobil" },
    { id: 2, label: "Info Kontak" },
    { id: 3, label: "Lokasi Inspeksi" },
    { id: 4, label: "Mobil Baru" },
  ];

  const [formData, setFormData] = useState({
    // Step 1
    brand: initialBrand,
    model: initialModel,
    variant: "",
    year: initialYear,
    transmission: "",
    stnkExpiry: "",
    color: "",
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
    // Step 4
    newCarBrand: "",
    newCarModel: "",
    newCarVariant: "",
    newCarTransmission: "",
    newCarColor: "",
    newCarPriceRange: "",
  });
  const [errors, setErrors] = useState({});

  // --- Refs ---
  // Step 1 Refs
  const brandSelectRef = useRef(null);
  const modelSelectRef = useRef(null);
  const variantSelectRef = useRef(null);
  const yearSelectRef = useRef(null);
  const transmissionSelectRef = useRef(null);
  const stnkExpiryInputRef = useRef(null);
  const colorSelectRef = useRef(null);
  const travelDistanceInputRef = useRef(null);

  // Step 4 Refs
  const newCarBrandRef = useRef(null);
  const newCarModelRef = useRef(null);
  const newCarVariantRef = useRef(null);
  const newCarTransmissionRef = useRef(null);
  const newCarColorRef = useRef(null);
  const newCarPriceRangeRef = useRef(null);

  const inputTimers = useRef({});

  // --- Effect untuk Inisialisasi Data Awal ---
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

    // Reset model/variant jika brand awal berubah
    if (initialBrand && initialBrand !== formData.brand) {
      setFormData((prev) => ({
        ...prev,
        model: initialModel || "",
        variant: "",
      }));
    }
    // Reset variant jika model awal berubah (dan brand sama)
    else if (
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
    formData.brand, // Tambahkan dependensi jika perlu
    formData.model, // Tambahkan dependensi jika perlu
  ]);

  // --- Opsi Select untuk Step 1 (Mobil Lama dari carData) ---
  const tradeInBrandOptions = useMemo(
    () =>
      Object.keys(carData).map((brand) => ({
        value: brand,
        label: brand,
      })),
    []
  );

  const tradeInModelOptions = useMemo(() => {
    return formData.brand && carData[formData.brand]?.Model
      ? Object.keys(carData[formData.brand].Model).map((model) => ({
          value: model,
          label: model,
        }))
      : [];
  }, [formData.brand]);

  const tradeInVariantOptions = useMemo(() => {
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

  // --- Filter Produk Tersedia dari Context ---
  const availableProducts = useMemo(() => {
    if (productsLoading || !products) return [];
    // Filter hanya produk yang statusnya "Tersedia"
    return products.filter((p) => p.status === "Tersedia");
  }, [products, productsLoading]);

  // --- Opsi Select DINAMIS untuk Step 4 (Mobil Baru dari Context) ---

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

  // --- Helper Memo: Filter produk berdasarkan Merek, Model, Varian yang dipilih ---
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

    // Filter lagi berdasarkan transmisi yang dipilih
    const filteredByBMVT = filteredProductsByBMV.filter(
      (p) => p.transmission === formData.newCarTransmission
    );

    const colors = new Set(
      filteredByBMVT.map((p) => p.carColor).filter(Boolean) // Ambil carColor dari produk
    );

    // Map warna unik ke objek dari staticCarColorOptions untuk mendapatkan hex
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
          hex: colorOption ? colorOption.hex : "#D3D3D3", // Default hex jika tidak ditemukan
        };
      });
  }, [productsLoading, filteredProductsByBMV, formData.newCarTransmission]);

  // --- Fungsi Clear Error ---
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

  // --- Handler untuk Input Biasa ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === "price" || name === "travelDistance") {
      const unformattedNum = unformatNumber(value);
      // Izinkan 0 atau angka positif, tapi simpan string kosong jika 0 untuk placeholder
      updatedValue = unformattedNum >= 0 ? unformattedNum.toString() : "";
    } else if (name === "phoneNumber") {
      const rawValue = unformatNumberPhone(value, PHONE_PREFIX);
      const numericValue = rawValue.replace(/\D/g, "");
      updatedValue = formatNumberPhone(numericValue, PHONE_PREFIX);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue ?? "", // Pastikan tidak null/undefined
    }));
    clearErrorOnChange(name);

    // --- Logika Auto Focus untuk Input (jika masih relevan) ---
    if (inputTimers.current[name]) {
      clearTimeout(inputTimers.current[name]);
    }
    if (!value) return; // Jangan trigger jika value kosong
    const inactivityDelay = 750; // Sesuaikan delay jika perlu
    if (name === "stnkExpiry") {
      setTimeout(() => colorSelectRef.current?.openDropdown(), 50);
    }
  };

  // --- Handler untuk Select (Termasuk Reset Step 4) ---
  const handleSelectChange = (name, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value ?? "" };

      // Reset Step 1 jika brand/model/variant mobil lama berubah
      if (name === "brand") {
        newData.model = "";
        newData.variant = "";
      } else if (name === "model") {
        newData.variant = "";
      }

      // Reset Step 4 jika brand/model/variant/transmisi mobil BARU berubah
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

    // Step 1 Auto Open
    if (name === "brand" && value) {
      setTimeout(() => modelSelectRef.current?.openDropdown(), 50);
    } else if (name === "model" && value) {
      setTimeout(() => variantSelectRef.current?.openDropdown(), 50);
    } else if (name === "variant" && value) {
      setTimeout(() => yearSelectRef.current?.openDropdown(), 50);
    } else if (name === "year" && value) {
      setTimeout(() => transmissionSelectRef.current?.openDropdown(), 50);
    } else if (name === "transmission" && value) {
      setTimeout(() => stnkExpiryInputRef.current?.focus(), 50);
    } else if (name === "color" && value) {
      setTimeout(() => travelDistanceInputRef.current?.focus(), 50);
    }

    // Step 4 Auto Open
    else if (name === "newCarBrand" && value) {
      setTimeout(() => newCarModelRef.current?.openDropdown(), 50);
    } else if (name === "newCarModel" && value) {
      setTimeout(() => newCarVariantRef.current?.openDropdown(), 50);
    } else if (name === "newCarVariant" && value) {
      setTimeout(() => newCarTransmissionRef.current?.openDropdown(), 50);
    } else if (name === "newCarTransmission" && value) {
      setTimeout(() => newCarColorRef.current?.openDropdown(), 50);
    } else if (name === "newCarColor" && value) {
      // Fokus atau buka dropdown price range setelah memilih warna
      setTimeout(() => newCarPriceRangeRef.current?.openDropdown(), 50);
    }
  };

  // --- Effect Cleanup Timer ---
  useEffect(() => {
    return () => {
      Object.values(inputTimers.current).forEach(clearTimeout);
    };
  }, []);

  // --- Fungsi Scroll ke Error Pertama ---
  const scrollToFirstError = (newErrors) => {
    const firstErrorKey = Object.keys(newErrors)[0];
    if (firstErrorKey) {
      let errorElement = document.getElementById(firstErrorKey);
      // Fallback jika ID tidak ditemukan (misal untuk Select), coba gunakan Ref
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
          name: null, // Asumsi input biasa punya ID
          phoneNumber: null, // Asumsi input biasa punya ID
          email: null, // Asumsi input biasa punya ID
          showroomAddress: null, // Tergantung implementasi Step 3
          province: null, // Tergantung implementasi Step 3
          city: null, // Tergantung implementasi Step 3
          fullAddress: null, // Tergantung implementasi Step 3
          inspectionDate: null, // Tergantung implementasi Step 3
          inspectionTime: null, // Tergantung implementasi Step 3
          newCarBrand: newCarBrandRef,
          newCarModel: newCarModelRef,
          newCarVariant: newCarVariantRef,
          newCarTransmission: newCarTransmissionRef,
          newCarColor: newCarColorRef,
          newCarPriceRange: newCarPriceRangeRef,
        };
        const errorRef = refMap[firstErrorKey];
        // Coba akses elemen DOM dari ref (mungkin perlu disesuaikan tergantung struktur komponen Select/Input)
        errorElement =
          errorRef?.current?.containerRef?.current || errorRef?.current; // Coba beberapa kemungkinan
        if (errorElement && typeof errorElement.querySelector === "function") {
          // Coba cari input/button di dalam elemen ref
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
        // Optional: Tambahkan sedikit fokus visual jika memungkinkan
        if (typeof errorElement.focus === "function") {
          // errorElement.focus({ preventScroll: true }); // Fokus tanpa scroll ulang
        }
      } else {
        // Fallback: scroll ke atas halaman jika elemen tidak ditemukan/tidak bisa di-scroll
        console.warn(
          `Could not find or scroll to element for error key: ${firstErrorKey}`
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // --- Fungsi Validasi ---
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
    else if (phoneFormatError) newErrors.phoneFormat = phoneFormatError; // Gunakan key berbeda untuk format
    if (!formData.email.trim()) newErrors.email = "Email wajib diisi.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Format email tidak valid.";

    // Gabungkan error wajib dan format
    const combinedErrors = { ...newErrors };
    if (phoneFormatError) combinedErrors.phoneNumber = phoneFormatError; // Tampilkan error format di field phone

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
        // Asumsi ini adalah Select value
        newErrors.showroomAddress = "Pilih alamat showroom.";
    } else if (formData.inspectionLocationType === "rumah") {
      if (!formData.province) newErrors.province = "Provinsi wajib diisi.";
      if (!formData.city) newErrors.city = "Kota/Kabupaten wajib diisi.";
      if (!formData.fullAddress.trim())
        newErrors.fullAddress = "Alamat lengkap wajib diisi.";
    }
    // Validasi jadwal hanya jika lokasi sudah dipilih
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
        className: "custom-toast", // Pastikan class ini ada di CSS global Anda
      });
    }
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    // Validasi berdasarkan opsi yang tersedia dan pilihan pengguna
    if (!formData.newCarBrand) {
      newErrors.newCarBrand = "Merek mobil baru wajib diisi.";
    }
    // Wajibkan Model jika Merek dipilih DAN ada opsi Model
    if (
      formData.newCarBrand &&
      availableNewCarModels.length > 0 &&
      !formData.newCarModel
    ) {
      newErrors.newCarModel = "Model mobil baru wajib diisi.";
    }
    // Wajibkan Varian jika Model dipilih DAN ada opsi Varian
    if (
      formData.newCarModel &&
      availableNewCarVariants.length > 0 &&
      !formData.newCarVariant
    ) {
      newErrors.newCarVariant = "Varian mobil baru wajib diisi.";
    }
    // Wajibkan Transmisi jika Varian dipilih DAN ada opsi Transmisi
    if (
      formData.newCarVariant &&
      availableNewCarTransmissions.length > 0 &&
      !formData.newCarTransmission
    ) {
      newErrors.newCarTransmission = "Transmisi wajib diisi.";
    }
    // Wajibkan Warna jika Transmisi dipilih DAN ada opsi Warna
    if (
      formData.newCarTransmission &&
      availableNewCarColors.length > 0 &&
      !formData.newCarColor
    ) {
      newErrors.newCarColor = "Warna wajib diisi.";
    }
    // Validasi Price Range (jika masih diperlukan dan wajib)
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

  // --- Navigasi Step ---
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
      // Toast error sudah di dalam validateStep3
    }
    // Tidak ada validasi saat lanjut dari step 3 ke 4, validasi step 4 terjadi saat submit

    if (isValid && currentStep < TradeInCarSteps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0); // Scroll ke atas saat ganti step
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0); // Scroll ke atas saat ganti step
    }
    // Jika ingin kembali dari step 1, bisa tambahkan navigasi router.back()
  };

  // --- Handler Submit Akhir ---
  const handleSubmit = () => {
    if (validateStep4()) {
      // Validasi step terakhir sebelum submit
      const rawPhoneNumber = unformatNumberPhone(
        formData.phoneNumber,
        PHONE_PREFIX
      );
      const submissionData = {
        // Data Mobil Lama (Step 1)
        tradeInBrand: formData.brand,
        tradeInModel: formData.model,
        tradeInVariant: formData.variant,
        tradeInYear: formData.year,
        tradeInTransmission: formData.transmission,
        tradeInStnkExpiry: formData.stnkExpiry,
        tradeInColor: formData.color,
        tradeInTravelDistance: unformatNumber(formData.travelDistance), // Kirim angka
        tradeInPrice: unformatNumber(formData.price), // Kirim angka
        // Data Kontak (Step 2)
        customerName: formData.name,
        customerPhoneNumber: rawPhoneNumber, // Kirim nomor tanpa format
        customerEmail: formData.email,
        // Data Inspeksi (Step 3)
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
        // Preferensi Mobil Baru (Step 4)
        newCarBrandPreference: formData.newCarBrand || undefined,
        newCarModelPreference: formData.newCarModel || undefined,
        newCarVariantPreference: formData.newCarVariant || undefined,
        newCarTransmissionPreference: formData.newCarTransmission || undefined,
        newCarColorPreference: formData.newCarColor || undefined,
        newCarPriceRangePreference: formData.newCarPriceRange || undefined,
      };

      // Hapus properti undefined sebelum mengirim (opsional, tergantung backend)
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

  // --- Render Komponen ---
  return (
    <div className="container mx-auto -mt-10 md:-mt-16 lg:-mt-20 relative z-20 px-4 md:px-0">
      <div className="bg-white shadow-lg p-4 md:p-8 rounded-2xl">
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
                brandOptions={tradeInBrandOptions}
                modelOptions={tradeInModelOptions}
                variantOptions={tradeInVariantOptions}
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
                // --- Kirim Opsi Dinamis ---
                brandOptions={availableNewCarBrands}
                modelOptions={availableNewCarModels}
                variantOptions={availableNewCarVariants}
                transmissionOptions={availableNewCarTransmissions}
                colorOptions={availableNewCarColors} // Kirim opsi warna dengan hex
                // --- Kirim Refs Step 4 ---
                brandRef={newCarBrandRef}
                modelRef={newCarModelRef}
                variantRef={newCarVariantRef}
                transmissionRef={newCarTransmissionRef}
                colorRef={newCarColorRef}
                priceRangeRef={newCarPriceRangeRef} // Kirim ref price range
                // --- Kirim Status Loading ---
                isLoading={productsLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeInCar;
