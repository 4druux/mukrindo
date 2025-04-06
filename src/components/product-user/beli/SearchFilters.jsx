// components/product-user/beli/SearchFilters.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import carData from "@/utils/carData";
import { formatYear } from "@/utils/formatYear";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import RangePrice from "@/components/common/RangePrice";

// Import Icons
import { ArrowRight, RefreshCw } from "lucide-react";

export const INITIAL_PRICE_RANGE = [50000000, 1500000000];

const SearchFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [productData, setProductData] = useState({
    brand: "",
    model: "",
    type: "",
    fuelType: "",
    priceRange: [...INITIAL_PRICE_RANGE],
    yearMin: "",
    yearMax: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const initialFilters = {
      brand: params.get("brand") || "",
      model: params.get("model") || "",
      type: params.get("type") || "",
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

  const brandOptionsForSelect = Object.keys(carData).map((brand) => ({
    value: brand,
    label: brand,
    ImgUrl: carData[brand].ImgUrl,
  }));

  const modelOptionsForSelect = useMemo(() => {
    return productData.brand && carData[productData.brand]?.Model
      ? Object.keys(carData[productData.brand].Model).map((model) => ({
          value: model,
          label: model,
        }))
      : [];
  }, [productData.brand]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
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

  const handleReset = () => {
    setProductData({
      brand: "",
      model: "",
      type: "",
      fuelType: "",
      priceRange: [...INITIAL_PRICE_RANGE],
      yearMin: "",
      yearMax: "",
    });
    router.push("/beli");
  };

  const isFilterActive = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    return (
      params.has("brand") ||
      params.has("model") ||
      params.has("type") ||
      params.has("fuelType") ||
      params.has("yearMin") ||
      params.has("yearMax") ||
      params.has("priceMin") ||
      params.has("priceMax")
    );
  }, [searchParams]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams);

    params.delete("search");

    if (productData.brand) params.set("brand", productData.brand);
    else params.delete("brand");

    if (productData.model) params.set("model", productData.model);
    else params.delete("model");

    if (productData.type) params.set("type", productData.type);
    else params.delete("type");

    if (productData.fuelType) params.set("fuelType", productData.fuelType);
    else params.delete("fuelType");

    if (productData.yearMin) params.set("yearMin", productData.yearMin);
    else params.delete("yearMin");

    if (productData.yearMax) params.set("yearMax", productData.yearMax);
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
  };

  return (
    <div
      className="rounded-3xl overflow-auto bg-white shadow-md flex flex-col"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="p-5 space-y-4">
        <h1 className="text-lg font-medium text-gray-700">Filter Pencarian</h1>

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
          // options={[{ value: "", label: "Semua Merek" }, ...brandOptionsForSelect]}
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
          disabled={!productData.brand}
          options={[
            { value: "", label: "Semua Model" },
            ...modelOptionsForSelect,
          ]}
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
          <label className="text-sm font-medium text-gray-700">Tahun</label>
          <div className="flex gap-2">
            <Input
              id="yearMin"
              name="yearMin"
              placeholderTexts={["Min Tahun", "Min Tahun", "Min Tahun"]}
              value={productData.yearMin}
              onChange={handleChange}
              formatter={formatYear}
              type="text"
              min="2000"
              max={new Date().getFullYear()}
            />
            <Input
              id="yearMax"
              name="yearMax"
              placeholderTexts={["Max Tahun", "Max Tahun", "Max Tahun"]}
              value={productData.yearMax}
              onChange={handleChange}
              formatter={formatYear}
              type="text"
              min="2000"
              max={new Date().getFullYear()}
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
          className="flex items-center justify-center gap-2 py-2.5 bg-orange-600 text-white rounded-full
        hover:bg-orange-500 transition duration-200 cursor-pointer w-full"
        >
          <span className="text-sm">Tampilkan Mobil</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;
