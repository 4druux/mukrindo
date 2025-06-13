// layout/user/product/CarForm.jsx
"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  formatNumberPhone,
  unformatNumberPhone,
} from "@/utils/formatNumberPhone";
import axiosInstance from "@/utils/axiosInstance";
import useSWR from "swr";
import { motion, useInView } from "framer-motion";

// Import Icon
import { FaCar, FaExchangeAlt, FaMoneyBillWave } from "react-icons/fa";
import BuyForm from "@/components/product-user/home/BuyForm";
import SellForm from "@/components/product-user/home/SellForm";
import TradeInForm from "@/components/product-user/home/TradeInForm";

export const INITIAL_PRICE_RANGE = [50000000, 1500000000];
const PHONE_PREFIX = "(+62) ";

const INITIAL_PRODUCT_DATA = {
  brand: "",
  model: "",
  priceRange: [...INITIAL_PRICE_RANGE],
  yearMin: "",
  yearMax: "",
  year: "",
  phoneNumber: PHONE_PREFIX,
};
const fetcher = (url) =>
  axiosInstance.get(url).then((res) => res.data?.data || []);

const CarForm = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [productData, setProductData] = useState({ ...INITIAL_PRODUCT_DATA });
  const [activeTab, setActiveTab] = useState("beli");

  // State for errors
  const [yearMinError, setYearMinError] = useState("");
  const [yearMaxError, setYearMaxError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");

  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);

  const {
    data: allCarData = [],
    error: carDataError,
    isLoading: isLoadingCarData,
  } = useSWR("/car-data/all-data", fetcher);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (params.toString()) {
      const initialFilters = {
        brand: params.get("brand") || "",
        model: params.get("model") || "",
        yearMin: params.get("yearMin") || "",
        yearMax: params.get("yearMax") || "",
        priceRange: [
          Number(params.get("priceMin")) || INITIAL_PRICE_RANGE[0],
          Number(params.get("priceMax")) || INITIAL_PRICE_RANGE[1],
        ],
        year: productData.year || "",
        phoneNumber: productData.phoneNumber || PHONE_PREFIX,
      };

      setProductData((prevData) => ({
        ...prevData,
        brand: params.has("brand") ? initialFilters.brand : prevData.brand,
        model: params.has("model") ? initialFilters.model : prevData.model,
        priceRange:
          params.has("priceMin") || params.has("priceMax")
            ? initialFilters.priceRange
            : prevData.priceRange,
        yearMin: params.has("yearMin")
          ? initialFilters.yearMin
          : prevData.yearMin,
        yearMax: params.has("yearMax")
          ? initialFilters.yearMax
          : prevData.yearMax,
        ...(params.has("brand") && params.get("brand") !== prevData.brand
          ? { model: "" }
          : {}),
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setProductData({ ...INITIAL_PRODUCT_DATA });

    setYearMinError("");
    setYearMaxError("");
    setPhoneNumberError("");
  }, [activeTab]);

  const brandOptionsForSelect = useMemo(
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

  const modelOptionsForSelect = useMemo(() => {
    if (!productData.brand) return [];
    const selectedBrandData = allCarData.find(
      (b) => b.brandName === productData.brand
    );
    return selectedBrandData?.models
      ? selectedBrandData.models
          .map((m) => ({
            value: m.name,
            label: m.name,
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
      : [];
  }, [productData.brand, allCarData]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 26 }, (_, i) => currentYear - i).map(
    (year) => ({
      value: year.toString(),
      label: year.toString(),
    })
  );

  const validateYears = (minYear, maxYear) => {
    let minError = "";
    let maxError = "";
    const currentYear = new Date().getFullYear();
    const minimumAllowedYear = 2000;
    const parsedMin = parseInt(minYear, 10);
    const parsedMax = parseInt(maxYear, 10);
    if (minYear && (isNaN(parsedMin) || parsedMin < minimumAllowedYear)) {
      minError = `Min tahun ${minimumAllowedYear}.`;
    }
    if (minYear && parsedMin > currentYear) {
      minError = `Max tahun ${currentYear}.`;
    }
    if (maxYear && (isNaN(parsedMax) || parsedMax > currentYear)) {
      maxError = `Max tahun ${currentYear}.`;
    }
    if (maxYear && parsedMax < minimumAllowedYear) {
      maxError = `Min tahun ${minimumAllowedYear}.`;
    }
    if (!minError && !maxError && minYear && maxYear && parsedMin > parsedMax) {
      maxError = "Harus > thn minimal.";
    }
    setYearMinError(minError);
    setYearMaxError(maxError);
    return { yearMinError: minError, yearMaxError: maxError };
  };

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
    setPhoneNumberError(error);
    return error;
  };

  // Run year
  useEffect(() => {
    // Hanya validasi jika di tab 'beli'
    if (activeTab === "beli") {
      validateYears(productData.yearMin, productData.yearMax);
    }
  }, [productData.yearMin, productData.yearMax, activeTab]);

  // Run phone
  useEffect(() => {
    // Hanya validasi jika di tab 'jual' atau 'tukar'
    if (activeTab === "jual" || activeTab === "tukar") {
      validatePhoneNumber(productData.phoneNumber);
    }
  }, [productData.phoneNumber, activeTab]);

  // Generic change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === "phoneNumber") {
      const rawValue = unformatNumberPhone(value, PHONE_PREFIX);
      const numericValue = rawValue.replace(/\D/g, "");
      finalValue = formatNumberPhone(numericValue, PHONE_PREFIX);
    }
    setProductData((prevData) => ({
      ...prevData,
      [name]: finalValue,
    }));
  };

  const handleFilterChange = (name, value) => {
    setProductData((prevData) => {
      const newData = { ...prevData, [name]: value };
      if (name === "brand") {
        newData.model = "";
      }
      return newData;
    });
  };

  const renderForm = () => {
    if (carDataError) {
      return (
        <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-sm h-[400px] flex items-center justify-center text-red-500">
          Gagal memuat opsi mobil.
        </div>
      );
    }

    const commonProps = {
      productData,
      handleFilterChange,
      handleChange,
      brandOptions: brandOptionsForSelect,
      modelOptions: modelOptionsForSelect,
    };
    switch (activeTab) {
      case "beli":
        return (
          <BuyForm
            key="buy-form"
            {...commonProps}
            yearMinError={yearMinError}
            yearMaxError={yearMaxError}
            validateYears={validateYears}
            INITIAL_PRICE_RANGE={INITIAL_PRICE_RANGE}
            isLoadingOptions={isLoadingCarData}
          />
        );
      case "jual":
        return (
          <SellForm
            key="sell-form"
            {...commonProps}
            yearOptions={years}
            phoneNumberError={phoneNumberError}
            validatePhoneNumber={validatePhoneNumber}
            PHONE_PREFIX={PHONE_PREFIX}
            isLoadingOptions={isLoadingCarData}
          />
        );
      case "tukar":
        return (
          <TradeInForm
            key="tradein-form"
            {...commonProps}
            yearOptions={years}
            phoneNumberError={phoneNumberError}
            validatePhoneNumber={validatePhoneNumber}
            PHONE_PREFIX={PHONE_PREFIX}
            isLoadingOptions={isLoadingCarData}
          />
        );
      default:
        return null;
    }
  };

  const handleTabClick = (tabName) => {
    if (tabName === activeTab) {
      return;
    }
    setActiveTab(tabName);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="flex w-full bg-gray-200 lg:w-fit rounded-t-3xl border-t-4 border-t-orange-500 md:border-none shadow-md">
        {/* Tab Beli Mobil */}
        <button
          onClick={() => handleTabClick("beli")}
          className={`relative w-full lg:w-fit rounded-tl-3xl lg:rounded-tl-2xl rounded-br-2xl cursor-pointer ${
            activeTab === "beli"
              ? "bg-white text-orange-500 before:absolute before:-right-5 before:top-0 before:h-6 before:w-10 before:bg-gray-200 before:content-[''] after:absolute after:top-0 after:right-0 after:h-6 after:w-5 after:rounded-tr-3xl after:bg-white after:content-['']"
              : activeTab === "jual"
              ? "bg-gray-200 text-gray-500 hover:text-gray-700 before:absolute before:-right-3 before:bottom-0 before:h-6 before:w-6 before:bg-white before:content-[''] after:absolute after:bottom-0 after:right-0 after:h-6 after:w-4 after:rounded-br-3xl after:bg-gray-200 after:content-['']"
              : "bg-gray-300 text-gray-500 hover:text-gray-700 before:absolute before:-right-3 before:top-0 before:h-6 before:w-6 before:bg-gray-300 before:content-[''] after:absolute after:top-0 after:right-0 after:h-6 after:w-4 after:rounded-tr-3xl after:bg-gray-300 after:content-['']"
          }`}
        >
          <div className="m-0 flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold lg:px-8">
            <div className="w-fit items-center justify-center lg:w-full">
              <div className="flex items-center justify-center gap-2 py-4">
                <FaCar className="w-4 h-4 hidden md:block" />
                <h3 className="text-xs lg:text-sm font-medium">Beli Mobil</h3>
              </div>
            </div>
          </div>
        </button>

        {/* Tab Jual Mobil */}
        <button
          onClick={() => handleTabClick("jual")}
          className={`relative w-full lg:w-fit rounded-tl-2xl cursor-pointer ${
            activeTab === "jual"
              ? "bg-white text-orange-500 before:absolute before:-right-5 before:top-0 before:h-6 before:w-10 before:bg-gray-200 before:content-[''] after:absolute after:top-0 after:right-0 after:h-6 after:w-6 after:rounded-tr-2xl after:bg-white after:content-['']"
              : activeTab === "tukar"
              ? "bg-gray-200 text-gray-500 hover:text-gray-700 before:absolute before:-right-3 before:bottom-0 before:h-6 before:w-6 before:bg-white before:content-[''] after:absolute after:bottom-0 after:right-0 after:h-6 after:w-4 after:rounded-br-3xl after:bg-gray-200 after:content-['']"
              : "bg-gray-200 text-gray-500 hover:text-gray-700 before:absolute before:-left-4 before:bottom-0 before:h-6 before:w-6 before:bg-white before:content-[''] after:absolute after:bottom-0 after:left-0 after:h-6 after:w-4 after:rounded-bl-3xl after:bg-gray-200 after:content-['']"
          }`}
        >
          <div className="m-0 flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold lg:px-8">
            <div className="w-fit items-center justify-center lg:w-full">
              <div className="flex items-center justify-center gap-2 py-4">
                <FaMoneyBillWave className="w-4 h-4 hidden md:block" />
                <h3 className="text-xs lg:text-sm font-medium">Jual Mobil</h3>
              </div>
            </div>
          </div>
        </button>

        {/* Tab Tukar Tambah */}
        <button
          onClick={() => handleTabClick("tukar")}
          className={`relative w-full lg:w-fit rounded-tr-3xl lg:rounded-tr-2xl rounded-bl-2xl cursor-pointer ${
            activeTab === "tukar"
              ? "bg-white text-orange-500 before:absolute before:-left-5 before:top-0 before:h-6 before:w-10 before:bg-gray-200 before:content-[''] after:absolute after:left-0 after:top-0 after:h-6 after:w-5 after:rounded-tl-3xl after:bg-white after:content-['']"
              : activeTab === "jual"
              ? "bg-gray-200 text-gray-500 hover:text-gray-700 before:absolute before:-left-3 before:bottom-0 before:h-6 before:w-6 before:bg-white before:content-[''] after:absolute after:bottom-0 after:left-0 after:h-6 after:w-4 after:rounded-bl-3xl after:bg-gray-200 after:content-['']"
              : "bg-gray-300 text-gray-500 hover:text-gray-700 before:absolute before:-left-3 before:top-0 before:h-6 before:w-8 before:bg-gray-300 before:content-[''] after:absolute after:top-0 after:-left-4 after:h-6 after:w-4 after:rounded-tr-3xl after:bg-gray-200 after:content-['']"
          }`}
        >
          <div className="m-0 flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold lg:px-8">
            <div className="w-fit items-center justify-center lg:w-full">
              <div className="flex items-center justify-center gap-2 py-4">
                <FaExchangeAlt className="w-4 h-4 hidden md:block" />
                <h3 className="text-xs lg:text-sm font-medium">Tukar Mobil</h3>
              </div>
            </div>
          </div>
        </button>
      </div>

      {renderForm()}
    </motion.div>
  );
};

export default CarForm;
