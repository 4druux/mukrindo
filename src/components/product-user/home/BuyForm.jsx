// layout/user/product/BuyForm.jsx
import React from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import RangePrice from "@/components/common/RangePrice";
import InputYear from "@/components/common/InputYear";
import toast from "react-hot-toast";

const BuyForm = ({
  productData,
  handleFilterChange,
  handleChange,
  brandOptions,
  modelOptions,
  yearMinError,
  yearMaxError,
  validateYears, // Pass validation function
  INITIAL_PRICE_RANGE, // Pass initial range constant
}) => {
  const router = useRouter();

  const handleSearchCar = () => {
    // Perform validation inside this component
    const { yearMinError: minErr, yearMaxError: maxErr } = validateYears(
      productData.yearMin,
      productData.yearMax
    );

    // Update errors locally or call a function passed from parent if needed
    // For simplicity here, we'll just use the validation result directly
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

    params.delete("page"); // Reset page number on new search

    const queryString = params.toString();
    router.push(`/beli${queryString ? `?${queryString}` : ""}`);
  };

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
          options={brandOptions}
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
          options={modelOptions}
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
        <div className="flex flex-col items-start mt-4 lg:mt-0">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Tahun
          </label>
          <div className="flex gap-4 w-full items-start">
            <div className="w-full">
              <InputYear
                id="yearMin"
                name="yearMin"
                label="Min Tahun"
                value={productData.yearMin}
                onChange={handleChange}
                error={yearMinError} // Pass error state down
                isHomeRoute={true}
              />
            </div>

            <div className="w-full">
              <InputYear
                id="yearMax"
                name="yearMax"
                label="Max Tahun"
                value={productData.yearMax}
                onChange={handleChange}
                error={yearMaxError} // Pass error state down
                isHomeRoute={true}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs lg:text-sm text-gray-500 flex-4">
          Dapatkan mobil terbaik untuk kebutuhanmu dengan harga terbaik di
          Mukrindo.id
        </p>
        <button
          className="w-full lg:flex-1 rounded-full py-3 text-sm text-white font-medium transition-colors duration-200
            bg-orange-600 hover:bg-orange-500 cursor-pointer"
          type="button"
          onClick={handleSearchCar} // Use the local handler
        >
          Temukan Mobil
        </button>
      </div>
    </div>
  );
};

export default BuyForm;
