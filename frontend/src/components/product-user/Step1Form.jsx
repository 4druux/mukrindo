// components/sell-car/Step1Form.jsx
import React from "react";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 26 }, (_, i) => currentYear - i).map(
  (year) => ({
    value: year.toString(),
    label: year.toString(),
  })
);

const Step1Form = ({
  formData,
  handleChange,
  handleSelectChange,
  errors,
  onNext,
  currentStep,
  totalCarSteps,
  brandOptions,
  modelOptions,
  variantOptions,
  formatNumber,
  colorOptions,
  brandRef,
  modelRef,
  variantRef,
  yearRef,
  transmissionRef,
  stnkExpiryRef,
  colorRef,
  travelDistanceRef,
  priceRef,
  isSellRoute = false,
}) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-1">
        Informasi Mobil Kamu
      </h2>
      <p className="text-sm text-gray-700 mb-6">
        Selesaikan {currentStep} dari {totalCarSteps.length} langkah dan
        lengkapi detail mobil {isSellRoute ? "yang ingin kamu jual" : "anda"}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select
          ref={brandRef}
          label="Merek Mobil"
          id="brand"
          name="brand"
          title="Pilih Merek"
          description="Pilih Merek Mobil Anda"
          options={brandOptions}
          value={formData.brand}
          onChange={(value) => handleSelectChange("brand", value)}
          error={errors.brand}
          searchOption={true}
        />
        <Select
          ref={modelRef}
          id="model"
          label="Model Mobil"
          name="model"
          title="Pilih Model"
          description={
            formData.brand
              ? "Pilih Model Mobil"
              : "Pilih Merek Mobil Terlebih Dahulu!"
          }
          options={modelOptions}
          value={formData.model}
          onChange={(value) => handleSelectChange("model", value)}
          disabled={!formData.brand}
          error={errors.model}
          searchOption={true}
        />
        <Select
          ref={variantRef}
          id="variant"
          label="Varian Mobil"
          name="variant"
          title="Pilih Varian"
          description={
            formData.model
              ? "Pilih Varian Mobil"
              : "Pilih Model Mobil Terlebih Dahulu!"
          }
          options={variantOptions}
          value={formData.variant}
          onChange={(value) => handleSelectChange("variant", value)}
          disabled={!formData.model || variantOptions.length === 0}
          error={errors.variant}
        />

        <Select
          ref={transmissionRef}
          id="transmission"
          label="Transmisi"
          name="transmission"
          title="Pilih Transmisi"
          description="Pilih Transmisi Mobil Anda"
          options={[
            { value: "Automatic", label: "Automatic" },
            { value: "Manual", label: "Manual" },
            { value: "CVT", label: "CVT" },
          ]}
          value={formData.transmission}
          onChange={(value) => handleSelectChange("transmission", value)}
          error={errors.transmission}
        />

        <Select
          ref={colorRef}
          label="Warna Mobil"
          id="color"
          name="color"
          title="Pilih Warna"
          description="Pilih warna mobil Anda saat ini"
          options={colorOptions}
          value={formData.color}
          onChange={(value) => handleSelectChange("color", value)}
          error={errors.color}
        />

        <Select
          ref={yearRef}
          label="Tahun"
          id="year"
          name="year"
          options={years}
          value={formData.year}
          onChange={(value) => handleSelectChange("year", value)}
          title="Pilih Tahun"
          description="Pilih Tahun Mobil Anda"
          disabled={!formData.variant}
          error={errors.year}
        />

        <Input
          ref={stnkExpiryRef}
          label="Masa Berlaku STNK"
          id="stnkExpiry"
          type="date"
          name="stnkExpiry"
          value={formData.stnkExpiry}
          onChange={handleChange}
          error={errors.stnkExpiry}
        />

        <Input
          ref={travelDistanceRef}
          label="Jarak Tempuh (KM)"
          id="travelDistance"
          name="travelDistance"
          inputMode="numeric"
          placeholderTexts={["50.000", "120.000", "200.000", "300.000"]}
          value={formData.travelDistance}
          onChange={handleChange}
          formatter={formatNumber}
          error={errors.travelDistance}
        />

        {isSellRoute && (
          <>
            <Input
              ref={priceRef}
              label="Harga Mobil"
              id="price"
              name="price"
              inputMode="numeric"
              value={formData.price}
              onChange={handleChange}
              formatter={formatNumber}
              error={errors.price}
              prefix="Rp "
            />
          </>
        )}
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={onNext}
          className="cursor-pointer bg-gradient-to-r from-orange-400 to-orange-600 hover:bg-orange-600 hover:from-transparent 
          hover:to-transparent text-white text-sm font-medium py-2.5 px-6 rounded-full focus:outline-none focus:shadow-outline"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
};

export default Step1Form;
