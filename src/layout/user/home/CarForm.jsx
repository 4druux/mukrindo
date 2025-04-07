// layout/user/product/CarForm.jsx
"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import RangePrice from "@/components/common/RangePrice";
import carData from "@/utils/carData";
import InputYear from "@/components/common/InputYear";
import toast from "react-hot-toast";
import {
  formatNumberPhone,
  unformatNumberPhone,
} from "@/utils/formatNumberPhone";

// Import Icon
import { FaCar, FaExchangeAlt, FaMoneyBillWave } from "react-icons/fa";

export const INITIAL_PRICE_RANGE = [50000000, 1500000000];

const CarForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("beli");

  const [yearMinError, setYearMinError] = useState("");
  const [yearMaxError, setYearMaxError] = useState("");

  const [productData, setProductData] = useState({
    brand: "",
    model: "",
    priceRange: [...INITIAL_PRICE_RANGE],
    yearMin: "",
    yearMax: "",
    year: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const initialFilters = {
      brand: params.get("brand") || "",
      model: params.get("model") || "",
      yearMin: params.get("yearMin") || "",
      yearMax: params.get("yearMax") || "",
      priceRange: [
        Number(params.get("priceMin")) || INITIAL_PRICE_RANGE[0],
        Number(params.get("priceMax")) || INITIAL_PRICE_RANGE[1],
      ],
      // Pertahankan nilai state yang tidak ada di URL jika sudah ada
      year: productData.year,
      phoneNumber: productData.phoneNumber,
    };
    // Hanya set state jika ada perubahan dari URL untuk mencegah loop tak terbatas
    if (
      JSON.stringify(initialFilters) !==
      JSON.stringify({
        brand: productData.brand,
        model: productData.model,
        yearMin: productData.yearMin,
        yearMax: productData.yearMax,
        priceRange: productData.priceRange,
        year: productData.year,
        phoneNumber: productData.phoneNumber,
      })
    ) {
      setProductData((prevData) => ({ ...prevData, ...initialFilters }));
    }
  }, [searchParams]);

  const brandOptionsForSelect = Object.keys(carData).map((brand) => ({
    value: brand,
    label: brand,
    ImgUrl: carData[brand].ImgUrl,
  }));

  // Opsi untuk Select Model (bergantung pada merek yang dipilih)
  const modelOptionsForSelect = useMemo(() => {
    return productData.brand && carData[productData.brand]?.Model
      ? Object.keys(carData[productData.brand].Model).map((model) => ({
          value: model,
          label: model,
        }))
      : [];
  }, [productData.brand]);

  // Opsi untuk Select Tahun (untuk tab jual/tukar)
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
    const parsedMin = parseInt(minYear, 10);
    const parsedMax = parseInt(maxYear, 10);

    if (minYear && (minYear.length !== 4 || isNaN(parsedMin))) {
      minError = "Tahun minimal tidak valid, contoh: 2012.";
    }

    if (!minError && minYear && parsedMin > currentYear) {
      minError = `Tahun minimal tidak boleh melebihi ${currentYear}.`;
    }

    if (maxYear && (maxYear.length !== 4 || isNaN(parsedMax))) {
      maxError = `Tahun maksimal tidak valid, contoh: ${currentYear}.`;
    }

    if (!maxError && maxYear && parsedMax > currentYear) {
      maxError = `Tahun maksimal tidak boleh melebihi ${currentYear}.`;
    }

    if (!minError && !maxError && minYear && maxYear && parsedMin > parsedMax) {
      maxError = "Harus lebih besar dari tahun minimal.";
    }

    return { yearMinError: minError, yearMaxError: maxError };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === "phoneNumber") {
      const rawValue = unformatNumberPhone(value);
      updatedValue = formatNumberPhone(rawValue);
    }

    setProductData((prevData) => ({
      ...prevData,
      [name]: name === "yearMin" || name === "yearMax" ? value : updatedValue,
    }));
  };

  useEffect(() => {
    const { yearMinError: minErr, yearMaxError: maxErr } = validateYears(
      productData.yearMin,
      productData.yearMax
    );
    setYearMinError(minErr);
    setYearMaxError(maxErr);
  }, [productData.yearMin, productData.yearMax]);

  // Handler  (Select, RangePrice)
  const handleFilterChange = (name, value) => {
    setProductData((prevData) => {
      const newData = { ...prevData, [name]: value };
      // Reset model jika merek berubah
      if (name === "brand") {
        newData.model = "";
      }

      return newData;
    });
  };

  // Fungsi untuk menerapkan filter di tab 'beli'
  const handleSearchCar = () => {
    const { yearMinError: minErr, yearMaxError: maxErr } = validateYears(
      productData.yearMin,
      productData.yearMax
    );
    setYearMinError(minErr);
    setYearMaxError(maxErr);

    if (minErr) {
      toast.error("Tahun Minimal Tidak Valid", { className: "custom-toast" });
      return;
    }
    if (maxErr) {
      toast.error("Tahun Maksimal Tidak Valid", { className: "custom-toast" });
      return;
    }
    const params = new URLSearchParams();

    if (productData.brand) params.set("brand", productData.brand);
    if (productData.model) params.set("model", productData.model);
    if (productData.yearMin && !minErr)
      params.set("yearMin", productData.yearMin);
    if (productData.yearMax && !maxErr)
      params.set("yearMax", productData.yearMax);

    if (productData.priceRange[0] !== INITIAL_PRICE_RANGE[0]) {
      params.set("priceMin", String(productData.priceRange[0]));
    }
    if (productData.priceRange[1] !== INITIAL_PRICE_RANGE[1]) {
      params.set("priceMax", String(productData.priceRange[1]));
    }

    params.delete("page");

    const queryString = params.toString();
    router.push(`/beli${queryString ? `?${queryString}` : ""}`);
  };

  // Fungsi render form berdasarkan tab aktif
  const renderForm = () => {
    switch (activeTab) {
      case "beli":
        return (
          <div className="bg-white lg:rounded-b-3xl lg:rounded-tr-3xl shadow-md p-4 md:p-6 w-full mx-auto">
            <h1 className="text-md font-medium text-gray-700 mb-4">
              Cari Mobil yang Anda Inginkan
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Select Merek */}
              <Select
                label="Merek"
                title="Pilih Merek"
                description="Pilih Merek Mobil"
                searchOption={true}
                options={brandOptionsForSelect}
                value={productData.brand}
                onChange={(value) => handleFilterChange("brand", value)}
              />

              {/* Select Model */}
              <Select
                label="Model"
                title="Pilih Model"
                description={
                  productData.brand
                    ? "Pilih Model Mobil"
                    : "Pilih Merek Mobil Terlebih Dahulu!"
                }
                // options={[
                //   { value: "", label: "Semua Model" },
                //   ...modelOptionsForSelect,
                // ]}
                options={modelOptionsForSelect}
                value={productData.model}
                onChange={(value) => handleFilterChange("model", value)}
                disabled={!productData.brand}
              />

              {/* Range Harga */}
              <RangePrice
                value={productData.priceRange}
                onChange={(range) => handleFilterChange("priceRange", range)}
                initialRange={INITIAL_PRICE_RANGE}
              />

              {/* Input Tahun Min & Max */}
              <div className="flex flex-col items-start">
                <label className="text-sm font-medium text-gray-700 block">
                  Tahun
                </label>
                <div className="flex gap-4 w-full items-start">
                  <div className="w-full">
                    <InputYear
                      id="yearMin"
                      name="yearMin"
                      placeholderTexts={["Min Tahun", "Min Tahun", "Min Tahun"]}
                      value={productData.yearMin}
                      onChange={handleChange}
                      error={yearMinError}
                    />
                  </div>
                  <div className="w-full">
                    <InputYear
                      id="yearMax"
                      name="yearMax"
                      placeholderTexts={["Max Tahun", "Max Tahun", "Max Tahun"]}
                      value={productData.yearMax}
                      onChange={handleChange}
                      error={yearMaxError}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
              <p className="text-xs lg:text-sm text-gray-500">
                Dapatkan mobil terbaik untuk kebutuhanmu dengan harga terbaik di
                Mukrindo.id
              </p>
              <button
                className="w-full md:w-auto py-3 px-16 rounded-full text-sm text-white font-medium transition-colors duration-200
                  bg-orange-500 hover:bg-orange-600 cursor-pointer"
                type="button"
                onClick={handleSearchCar}
              >
                Temukan Mobil
              </button>
            </div>
          </div>
        );

      case "jual":
      case "tukar":
        return (
          <div className="bg-white lg:rounded-b-3xl lg:rounded-tr-3xl shadow-md p-4 md:p-6 w-full mx-auto">
            <h1 className="text-md font-medium text-gray-700 mb-4">
              Informasi Mobil Kamu
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Select Merek */}
              <Select
                label="Merek"
                title="Pilih Merek"
                description="Pilih Merek Mobil Anda"
                searchOption={true}
                options={brandOptionsForSelect}
                value={productData.brand}
                onChange={(value) => handleFilterChange("brand", value)}
              />

              {/* Select Model */}
              <Select
                label="Model"
                description={
                  productData.brand
                    ? "Pilih Model Mobil Anda"
                    : "Pilih Merek Mobil Anda Terlebih Dahulu!"
                }
                // options={[
                //   { value: "", label: "Pilih Model" },
                //   ...modelOptionsForSelect,
                // ]}
                options={modelOptionsForSelect}
                value={productData.model}
                onChange={(value) => handleFilterChange("model", value)}
                title="Pilih Model"
                disabled={!productData.brand}
              />

              {/* Select Tahun */}
              <Select
                label="Tahun"
                title="Pilih Tahun"
                description="Pilih Tahun Mobil Anda"
                value={productData.year}
                onChange={(value) => handleFilterChange("year", value)}
                options={years}
              />

              {/* Input No Handphone */}
              <Input
                label="No Handphone"
                id="phoneNumber"
                name="phoneNumber"
                value={productData.phoneNumber}
                onChange={handleChange}
                prefix="+62 "
                placeholderTexts={["812-3456-7890"]}
                type="tel"
              />
            </div>

            {/* Deskripsi dan Tombol Aksi */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
              <p className="text-xs lg:text-sm text-gray-500">
                Dapatkan estimasi harga dari mobil kamu dengan proses yang cepat
                dan mudah di Mukrindo.id
              </p>
              <button
                className="w-full md:w-auto py-3 px-16 rounded-full text-sm text-white font-medium transition-colors duration-200
                  bg-orange-500 hover:bg-orange-600"
                type="button"
                // onClick={handleSubmitJualTukar} // Anda perlu membuat fungsi ini nanti
              >
                {activeTab === "jual" ? "Jual Sekarang" : "Lanjut Tukar"}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex w-full bg-gray-200 lg:w-fit rounded-t-3xl shadow-md">
        {/* Tab Beli Mobil */}
        <button
          onClick={() => setActiveTab("beli")}
          className={`relative w-full lg:w-fit rounded-tl-3xl rounded-br-2xl cursor-pointer ${
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
                <FaCar className="w-4 h-4 hidden lg:block" />
                <h3 className="text-xs lg:text-sm font-medium">Beli Mobil</h3>
              </div>
            </div>
          </div>
        </button>

        {/* Tab Jual Mobil */}
        <button
          onClick={() => setActiveTab("jual")}
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
                <FaMoneyBillWave className="w-4 h-4 hidden lg:block" />
                <h3 className="text-xs lg:text-sm font-medium">Jual Mobil</h3>
              </div>
            </div>
          </div>
        </button>

        {/* Tab Tukar Tambah */}
        <button
          onClick={() => setActiveTab("tukar")}
          className={`relative w-full lg:w-fit rounded-tr-3xl rounded-bl-2xl cursor-pointer ${
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
                <FaExchangeAlt className="w-4 h-4 hidden lg:block" />
                <h3 className="text-xs lg:text-sm font-medium">Tukar Mobil</h3>
              </div>
            </div>
          </div>
        </button>
      </div>
      {renderForm()}
    </div>
  );
};

export default CarForm;
