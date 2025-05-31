// components/product-user/beli/SearchFilters.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Select from "@/components/common/Select";
import RangePrice from "@/components/common/RangePrice";
import axiosInstance from "@/utils/axiosInstance";
import useSWR from "swr";

// Import Icons
import { ArrowRight, RefreshCw } from "lucide-react";
import InputYear from "@/components/common/InputYear";
import toast from "react-hot-toast";

export const INITIAL_PRICE_RANGE = [50000000, 1500000000];

const fetcher = (url) =>
  axiosInstance.get(url).then((res) => res.data?.data || []);

const SearchFilters = ({ onActionComplete = () => {} }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [yearMinError, setYearMinError] = useState("");
  const [yearMaxError, setYearMaxError] = useState("");

  const [productData, setProductData] = useState({
    brand: "",
    model: "",
    type: "",
    transmission: "",
    fuelType: "",
    priceRange: [...INITIAL_PRICE_RANGE],
    yearMin: "",
    yearMax: "",
  });

  const {
    data: allCarData = [],
    error: carDataError,
    isLoading: isLoadingCarData,
  } = useSWR("/api/car-data/all-data", fetcher);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const initialFilters = {
      brand: params.get("brand") || "",
      model: params.get("model") || "",
      type: params.get("type") || "",
      transmission: params.get("transmission") || "",
      fuelType: params.get("fuelType") || "",
      yearMin: params.get("yearMin") || "",
      yearMax: params.get("yearMax") || "",
      priceRange: [
        Number(params.get("priceMin")) || INITIAL_PRICE_RANGE[0],
        Number(params.get("priceMax")) || INITIAL_PRICE_RANGE[1],
      ],
    };
    setProductData(initialFilters);
  }, [searchParams]);

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

  const validateYears = (minYear, maxYear) => {
    let minError = "";
    let maxError = "";
    const currentYear = new Date().getFullYear();
    const minimumAllowedYear = 2000;
    const parsedMin = parseInt(minYear, 10);
    const parsedMax = parseInt(maxYear, 10);

    if (!minError && minYear && parsedMin < minimumAllowedYear) {
      minError = `Min tahun ${minimumAllowedYear} keatas.`;
    }

    if (!minError && minYear && parsedMin > currentYear) {
      minError = `Max tahun ${currentYear}.`;
    }

    if (!maxError && maxYear && parsedMax > currentYear) {
      maxError = `Max tahun ${currentYear}.`;
    }

    if (!maxError && maxYear && parsedMax < minimumAllowedYear) {
      maxError = `Min tahun ${minimumAllowedYear} keatas.`;
    }

    if (!minError && !maxError && minYear && maxYear && parsedMin > parsedMax) {
      maxError = "Harus lebih besar dari tahun minimal.";
    }

    return { yearMinError: minError, yearMaxError: maxError };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
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

  const handleFilterChange = (name, value) => {
    setProductData((prevData) => {
      const newData = { ...prevData, [name]: value };
      if (name === "brand") {
        newData.model = "";
      }
      return newData;
    });
  };

  const handleReset = () => {
    setProductData({
      brand: "",
      model: "",
      type: "",
      transmission: "",
      fuelType: "",
      priceRange: [...INITIAL_PRICE_RANGE],
      yearMin: "",
      yearMax: "",
    });
    router.push("/beli");
    onActionComplete();
  };

  const isFilterActive = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    return (
      params.has("brand") ||
      params.has("model") ||
      params.has("type") ||
      params.has("transmission") ||
      params.has("fuelType") ||
      params.has("yearMin") ||
      params.has("yearMax") ||
      params.has("priceMin") ||
      params.has("priceMax")
    );
  }, [searchParams]);

  const handleApplyFilters = () => {
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

    const params = new URLSearchParams(searchParams);

    params.delete("search");

    if (productData.brand) params.set("brand", productData.brand);
    else params.delete("brand");

    if (productData.model) params.set("model", productData.model);
    else params.delete("model");

    if (productData.type) params.set("type", productData.type);
    else params.delete("type");

    if (productData.transmission)
      params.set("transmission", productData.transmission);
    else params.delete("transmission");

    if (productData.fuelType) params.set("fuelType", productData.fuelType);
    else params.delete("fuelType");

    if (productData.yearMin && !minErr)
      params.set("yearMin", productData.yearMin);
    else params.delete("yearMin");

    if (productData.yearMax && !maxErr)
      params.set("yearMax", productData.yearMax);
    else params.delete("yearMax");

    if (productData.priceRange[0] !== INITIAL_PRICE_RANGE[0]) {
      params.set("priceMin", String(productData.priceRange[0]));
    } else {
      params.delete("priceMin");
    }
    if (productData.priceRange[1] !== INITIAL_PRICE_RANGE[1]) {
      params.set("priceMax", String(productData.priceRange[1]));
    } else {
      params.delete("priceMax");
    }

    params.delete("page");

    const queryString = params.toString();
    router.push(`/beli${queryString ? `?${queryString}` : ""}`);

    onActionComplete();
  };

  return (
    <div
      className="rounded-none 2xl:rounded-3xl pb-4 2xl:pb-0 overflow-auto bg-white shadow-none 2xl:shadow-md flex flex-col"
      style={{ scrollbarWidth: "none" }}
    >
      {carDataError && (
        <div className="text-center p-4 text-red-500">
          Gagal memuat opsi mobil.
        </div>
      )}

      <div className="p-5 space-y-4">
        <div className="hidden lg:block">
          <h1 className="text-lg font-medium text-gray-700">
            Filter Pencarian
          </h1>
        </div>
        {/* Harga */}
        <RangePrice
          value={productData.priceRange}
          onChange={(range) => handleFilterChange("priceRange", range)}
          initialRange={INITIAL_PRICE_RANGE}
        />

        {/* Merek */}
        <Select
          label="Merek"
          title="Pilih Merek"
          description="Pilih Merek Mobil"
          options={brandOptionsForSelect}
          value={productData.brand}
          onChange={(value) => handleFilterChange("brand", value)}
          searchOption={true}
          disabled={isLoadingCarData}
        />

        {/* Model */}
        <Select
          label="Model"
          title="Pilih Model"
          description={
            productData.brand
              ? "Pilih Model Mobil"
              : "Pilih Merek Mobil Terlebih Dahulu!"
          }
          value={productData.model}
          onChange={(value) => handleFilterChange("model", value)}
          disabled={
            isLoadingCarData ||
            !productData.brand ||
            (productData.brand && modelOptionsForSelect.length === 0)
          }
          options={[...modelOptionsForSelect]}
          searchOption={true}
        />

        {/* Tipe Mobil */}
        <Select
          label="Tipe Mobil"
          id="type"
          name="type"
          value={productData.type}
          title="Tipe Mobil"
          description="Jenis Tipe Mobil"
          onChange={(value) => handleFilterChange("type", value)}
          options={[
            {
              value: "sedan",
              label: "Sedan",
              ImgUrl: "/images/CarType/sedan.png",
            },
            {
              value: "hatchback",
              label: "Hatchback",
              ImgUrl: "/images/CarType/hatchback.png",
            },
            { value: "suv", label: "SUV", ImgUrl: "/images/CarType/suv.png" },
            { value: "mpv", label: "MPV", ImgUrl: "/images/CarType/mpv.png" },
            {
              value: "minibus",
              label: "Minibus",
              ImgUrl: "/images/CarType/minibus.png",
            },
          ]}
        />

        {/* Transmisi */}
        <Select
          label="Transmisi"
          id="transmission"
          name="transmission"
          value={productData.transmission}
          title="Transmisi"
          description="Jenis Transmisi"
          onChange={(value) => handleFilterChange("transmission", value)}
          options={[
            { value: "manual", label: "Manual" },
            { value: "automatic", label: "Automatic" },
            { value: "cvt", label: "CVT" },
          ]}
        />

        {/* Bahan Bakar */}
        <Select
          label="Bahan Bakar"
          id="fuelType"
          name="fuelType"
          value={productData.fuelType}
          title="Bahan Bakar"
          description="Jenis Bahan Bakar"
          onChange={(value) => handleFilterChange("fuelType", value)}
          options={[
            { value: "bensin", label: "Bensin" },
            { value: "solar", label: "Solar" },
            { value: "hybrid", label: "Hybrid" },
            { value: "electric", label: "Electric" },
          ]}
        />

        {/* Tahun */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 mb-3">
            Tahun
          </label>
          <div className="flex gap-2 items-start">
            <InputYear
              id="yearMin"
              name="yearMin"
              label="Min Tahun"
              value={productData.yearMin}
              onChange={handleChange}
              error={yearMinError}
            />

            <InputYear
              id="yearMax"
              name="yearMax"
              label="Max Tahun"
              value={productData.yearMax}
              onChange={handleChange}
              error={yearMaxError}
            />
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200" />

      {/* Tombol */}
      <div className="flex flex-col items-center gap-2 p-5">
        {isFilterActive && (
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 py-2 border border-orange-600 text-orange-600
            rounded-full hover:bg-orange-50 transition duration-200 cursor-pointer w-full"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="text-sm">Reset Filter</span>
          </button>
        )}

        <button
          onClick={handleApplyFilters}
          disabled={isLoadingCarData}
          className="flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-400 to-orange-600 
          hover:bg-orange-600 hover:from-transparent hover:to-transparent text-white rounded-full
          cursor-pointer w-full"
        >
          <span className="text-sm">Tampilkan Mobil</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;
