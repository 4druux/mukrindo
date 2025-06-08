import React from "react";
import Select from "@/components/common/Select";
import ButtonMagnetic from "../common/ButtonMagnetic";
import ButtonAction from "../common/ButtonAction";
import DotLoader from "../common/DotLoader";

const priceRangeOptions = [
  { value: "0-100", label: "Rp 0 - 100 Juta" },
  { value: "101-200", label: "Rp 101 - 200 Juta" },
  { value: "201-300", label: "Rp 201 - 300 Juta" },
  { value: "301-500", label: "Rp 301 - 500 Juta" },
  { value: "500+", label: "Diatas Rp 500 Juta" },
];

const Step4Form = ({
  formData,
  handleSelectChange,
  errors,
  onSubmit,
  onBack,
  currentStep,
  totalCarSteps,
  termsAccepted,
  onTermsChange,
  termsError,
  brandOptions,
  modelOptions,
  variantOptions,
  transmissionOptions,
  colorOptions,
  brandRef,
  modelRef,
  variantRef,
  transmissionRef,
  colorRef,
  priceRangeRef,
  isLoading,
}) => {
  const noBrandSelected = !formData.newCarBrand;
  const noModelSelected = !formData.newCarModel;
  const noVariantSelected = !formData.newCarVariant;
  const noTransmissionSelected = !formData.newCarTransmission;

  const noModelsAvailable = modelOptions.length === 0;
  const noVariantsAvailable = variantOptions.length === 0;
  const noTransmissionsAvailable = transmissionOptions.length === 0;
  const noColorsAvailable = colorOptions.length === 0;

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-700 mb-1">
        Preferensi Mobil Baru Kamu
      </h2>
      <p className="text-sm text-gray-700 mb-6">
        Selesaikan {currentStep} dari {totalCarSteps.length} langkah dan beri
        tahu kami mobil baru seperti apa yang kamu inginkan dari stok yang
        tersedia.
      </p>

      {isLoading && (
        <div className="flex justify-center items-center h-[250px]">
          <DotLoader />
        </div>
      )}

      {!isLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Select
              ref={brandRef}
              label="Merek Mobil Baru"
              id="newCarBrand"
              name="newCarBrand"
              title="Pilih Merek"
              description={
                brandOptions.length === 0
                  ? "Tidak ada merek tersedia"
                  : "Pilih Merek Mobil Baru Tersedia"
              }
              options={brandOptions}
              value={formData.newCarBrand}
              onChange={(value) => handleSelectChange("newCarBrand", value)}
              error={errors.newCarBrand}
              searchOption={true}
              disabled={isLoading || brandOptions.length === 0}
            />

            <Select
              ref={modelRef}
              id="newCarModel"
              label="Model Mobil Baru"
              name="newCarModel"
              title="Pilih Model"
              description={
                noBrandSelected
                  ? "Pilih Merek Terlebih Dahulu"
                  : noModelsAvailable
                  ? "Tidak ada model tersedia"
                  : "Pilih Model Mobil Baru Tersedia"
              }
              options={modelOptions}
              value={formData.newCarModel}
              onChange={(value) => handleSelectChange("newCarModel", value)}
              disabled={isLoading || noBrandSelected || noModelsAvailable}
              error={errors.newCarModel}
            />

            <Select
              ref={variantRef}
              id="newCarVariant"
              label="Varian Mobil Baru"
              name="newCarVariant"
              title="Pilih Varian"
              description={
                noModelSelected
                  ? "Pilih Model Terlebih Dahulu"
                  : noVariantsAvailable
                  ? "Tidak ada varian tersedia"
                  : "Pilih Varian Mobil Baru Tersedia"
              }
              options={variantOptions}
              value={formData.newCarVariant}
              onChange={(value) => handleSelectChange("newCarVariant", value)}
              disabled={isLoading || noModelSelected || noVariantsAvailable}
              error={errors.newCarVariant}
            />

            <Select
              ref={transmissionRef}
              id="newCarTransmission"
              label="Transmisi Pilihan"
              name="newCarTransmission"
              title="Pilih Transmisi"
              description={
                noVariantSelected
                  ? "Pilih Varian Terlebih Dahulu"
                  : noTransmissionsAvailable
                  ? "Tidak ada transmisi tersedia"
                  : "Pilih preferensi transmisi tersedia"
              }
              options={transmissionOptions}
              value={formData.newCarTransmission}
              onChange={(value) =>
                handleSelectChange("newCarTransmission", value)
              }
              error={errors.newCarTransmission}
              disabled={
                isLoading || noVariantSelected || noTransmissionsAvailable
              }
            />

            <Select
              ref={colorRef}
              id="newCarColor"
              label="Warna Pilihan"
              name="newCarColor"
              title="Pilih Warna"
              description={
                noTransmissionSelected
                  ? "Pilih Transmisi Terlebih Dahulu"
                  : noColorsAvailable
                  ? "Tidak ada warna tersedia"
                  : "Pilih preferensi warna tersedia"
              }
              options={colorOptions}
              value={formData.newCarColor}
              onChange={(value) => handleSelectChange("newCarColor", value)}
              error={errors.newCarColor}
              disabled={
                isLoading || noTransmissionSelected || noColorsAvailable
              }
            />

            <Select
              ref={priceRangeRef}
              label="Rentang Harga"
              id="newCarPriceRange"
              name="newCarPriceRange"
              options={priceRangeOptions}
              value={formData.newCarPriceRange}
              onChange={(value) =>
                handleSelectChange("newCarPriceRange", value)
              }
              title="Pilih Rentang Harga"
              description="Pilih rentang harga mobil baru"
              error={errors.newCarPriceRange}
              disabled={isLoading}
            />
          </div>
        </>
      )}

      <div className="flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-0 lg:items-center mt-4">
        <div className="">
          <label
            id="terms-checkbox-label"
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="checkbox"
              name="termsAccepted"
              checked={termsAccepted}
              onChange={onTermsChange}
              className="form-checkbox h-4 w-4 accent-orange-600 rounded border-gray-300 cursor-pointer"
            />
            <span className="text-xs text-gray-700">
              Saya setuju dengan{" "}
              <a
                href="/syarat-ketentuan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-600 hover:underline font-medium"
              >
                Syarat dan Ketentuan
              </a>{" "}
              serta{" "}
              <a
                href="/kebijakan-privasi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-600 hover:underline font-medium"
              >
                Kebijakan Privasi
              </a>{" "}
              dari Mukrindo Motor
            </span>
          </label>
          {termsError && (
            <p className="mt-1 ml-5 text-[10px] text-red-600">{termsError}</p>
          )}
        </div>

        <div className="flex justify-end gap-x-2 sm:gap-x-4 mt-4">
          <ButtonMagnetic
            type="button"
            onClick={onBack}
            className="!py-2.5 !m-0"
          >
            Kembali
          </ButtonMagnetic>

          <ButtonAction type="button" onClick={onSubmit} disabled={isLoading}>
            Tukar Sekarang
          </ButtonAction>
        </div>
      </div>
    </div>
  );
};

export default Step4Form;
