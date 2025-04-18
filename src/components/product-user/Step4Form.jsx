import React from "react";
import Select from "@/components/common/Select";

// Opsi rentang harga tetap statis (atau bisa dibuat dinamis jika perlu)
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
  // --- Terima Opsi Dinamis ---
  brandOptions,
  modelOptions,
  variantOptions,
  transmissionOptions,
  colorOptions, // Terima opsi warna (sudah termasuk hex dari TradeInCar)
  // --- Terima Refs ---
  brandRef,
  modelRef,
  variantRef,
  transmissionRef,
  colorRef,
  priceRangeRef,
  // --- Terima Status Loading ---
  isLoading,
}) => {
  // Logika disabled berdasarkan state formData dan ketersediaan opsi
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
        <div className="flex justify-center items-center my-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500"></div>
          <p className="ml-3 text-gray-600">Memuat opsi mobil...</p>
        </div>
      )}
      {/* Tampilkan Form jika tidak loading */}
      {!isLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* 1. Merek */}
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
              searchOption={true} // Aktifkan search jika banyak merek
              disabled={isLoading || brandOptions.length === 0} // Disable jika loading atau tidak ada opsi
            />
            {/* 2. Model */}
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
              disabled={isLoading || noBrandSelected || noModelsAvailable} // Disable jika loading, merek belum dipilih, atau tidak ada model
              error={errors.newCarModel}
            />
            {/* 3. Varian */}
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
              disabled={isLoading || noModelSelected || noVariantsAvailable} // Disable jika loading, model belum dipilih, atau tidak ada varian
              error={errors.newCarVariant}
            />
            {/* 4. Transmisi */}
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
              options={transmissionOptions} // Gunakan opsi dinamis
              value={formData.newCarTransmission}
              onChange={(value) =>
                handleSelectChange("newCarTransmission", value)
              }
              error={errors.newCarTransmission}
              disabled={
                isLoading || noVariantSelected || noTransmissionsAvailable
              } // Disable jika loading, varian belum dipilih, atau tidak ada transmisi
            />
            {/* 5. Warna */}
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
              options={colorOptions} // Gunakan opsi dinamis (sudah ada hex)
              value={formData.newCarColor}
              onChange={(value) => handleSelectChange("newCarColor", value)}
              error={errors.newCarColor}
              disabled={
                isLoading || noTransmissionSelected || noColorsAvailable
              } // Disable jika loading, transmisi belum dipilih, atau tidak ada warna
            />
            {/* 6. Rentang Harga (Tetap Statis) */}
            <Select
              ref={priceRangeRef}
              label="Rentang Harga"
              id="newCarPriceRange"
              name="newCarPriceRange"
              options={priceRangeOptions} // Tetap statis
              value={formData.newCarPriceRange}
              onChange={(value) =>
                handleSelectChange("newCarPriceRange", value)
              }
              title="Pilih Rentang Harga"
              description="Pilih rentang harga mobil baru"
              error={errors.newCarPriceRange}
              disabled={isLoading} // Hanya disable saat loading awal
            />
          </div>
          {/* Tombol Kembali dan Submit */}
          <div className="flex justify-end space-x-2 sm:space-x-4 mt-4">
            <button
              type="button"
              onClick={onBack}
              className="cursor-pointer border text-orange-600 border-orange-500 hover:bg-orange-100 hover:border-orange-500
              hover:text-orange-600 text-sm font-medium py-2.5 px-6 rounded-full focus:outline-none focus:shadow-outline"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isLoading} // Disable tombol submit saat loading
              className={`cursor-pointer bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium py-2.5 px-6 rounded-full focus:outline-none focus:shadow-outline ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Tukar Sekarang
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Step4Form;
