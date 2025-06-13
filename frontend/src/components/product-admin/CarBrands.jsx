// frontend/src/components/product-admin/CarBrands.jsx
"use client";
import { useMemo } from "react";
import Select from "../common/Select";
import { Trash2 } from "lucide-react";
import { useCarData } from "@/context/CarDataContext";

const CarBrands = ({
  brand,
  model,
  variant,
  onChange,
  errors,
  brandRef,
  modelRef,
  variantRef,
  isAdmin = false,
}) => {
  const {
    allCarData,
    carDataError,
    isLoadingAllCarData,
    isMutatingCarData,
    handleAddBrand,
    handleAddModel,
    handleAddVariant,
    handleDeleteBrand,
    handleDeleteModel,
    handleDeleteVariant,
  } = useCarData();

  const currentFormData = useMemo(
    () => ({ brand, model, variant }),
    [brand, model, variant]
  );

  const brandOptions = useMemo(
    () =>
      allCarData
        .map((b) => ({
          value: b.brandName,
          label: b.brandName,
          ImgUrl: b.imgUrl || "/images/Carbrand/default.png",
          canDelete: isAdmin,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [allCarData, isAdmin]
  );

  const modelOptions = useMemo(() => {
    if (!brand) return [];
    const selectedBrandData = allCarData.find((b) => b.brandName === brand);
    return selectedBrandData?.models
      ? selectedBrandData.models
          .map((m) => ({
            value: m.name,
            label: m.name,
            canDelete: isAdmin && !!brand,
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
      : [];
  }, [brand, allCarData, isAdmin]);

  const variantOptions = useMemo(() => {
    if (!brand || !model) return [];
    const selectedBrandData = allCarData.find((b) => b.brandName === brand);
    const selectedModelData = selectedBrandData?.models?.find(
      (m) => m.name === model
    );
    return selectedModelData?.variants
      ? selectedModelData.variants
          .map((v) => ({
            value: v.name,
            label: v.name,
            canDelete: isAdmin && !!brand && !!model,
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
      : [];
  }, [brand, model, allCarData, isAdmin]);

  if (isAdmin && carDataError) {
    return (
      <div className="text-red-500 col-span-3 p-4 border border-red-300 rounded-md bg-red-50">
        Gagal memuat data master mobil:{" "}
        {carDataError.response?.data?.message ||
          carDataError.message ||
          "Cek koneksi backend atau endpoint API."}
        <br />
        Pastikan endpoint <strong>/car-data/all-data</strong> sudah benar dan
        backend berjalan.
      </div>
    );
  }

  const commonSelectProps = {
    searchOption: true,
    isActionInProgress: isMutatingCarData,
    disabled: isLoadingAllCarData || isMutatingCarData,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Select
        ref={brandRef}
        label="Merek Mobil"
        id="brand"
        name="brand"
        value={brand}
        error={errors?.brand}
        title="Merek Mobil"
        description="Pilih Merek Mobil"
        options={brandOptions}
        onChange={(value) => {
          onChange("brand", value);
          onChange("model", "");
          onChange("variant", "");
        }}
        allowAdd={isAdmin}
        onAddOption={(newLabel) => handleAddBrand(newLabel, onChange)}
        itemActions={
          isAdmin
            ? (optionValue, optionLabel) => (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBrand(optionValue, currentFormData, onChange);
                  }}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full cursor-pointer"
                  title={`Hapus merek ${optionLabel}`}
                  disabled={isMutatingCarData}
                >
                  <Trash2 size={14} />
                </button>
              )
            : undefined
        }
        {...commonSelectProps}
        disabled={
          commonSelectProps.disabled ||
          (brandOptions.length === 0 && !isAdmin && !carDataError)
        }
      />

      <Select
        ref={modelRef}
        label="Model Mobil"
        id="model"
        name="model"
        value={model}
        error={errors?.model}
        title="Model Mobil"
        description={
          brand ? "Pilih Model Mobil" : "Pilih Merek Mobil Terlebih Dahulu!"
        }
        options={modelOptions}
        onChange={(value) => {
          onChange("model", value);
          onChange("variant", "");
        }}
        allowAdd={isAdmin && !!brand}
        onAddOption={(newLabel) => handleAddModel(brand, newLabel, onChange)}
        itemActions={
          isAdmin && !!brand
            ? (optionValue, optionLabel) => (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteModel(
                      brand,
                      optionValue,
                      currentFormData,
                      onChange
                    );
                  }}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full cursor-pointer"
                  title={`Hapus model ${optionLabel}`}
                  disabled={isMutatingCarData}
                >
                  <Trash2 size={14} />
                </button>
              )
            : undefined
        }
        {...commonSelectProps}
        disabled={
          commonSelectProps.disabled ||
          !brand ||
          (modelOptions.length === 0 && !isAdmin && !!brand)
        }
      />

      <Select
        ref={variantRef}
        label="Varian Mobil"
        id="variant"
        name="variant"
        value={variant}
        error={errors?.variant}
        title="Varian Mobil"
        description={
          model ? "Pilih Varian Mobil" : "Pilih Model Mobil Terlebih Dahulu!"
        }
        options={variantOptions}
        onChange={(value) => onChange("variant", value)}
        allowAdd={isAdmin && !!brand && !!model}
        onAddOption={(newLabel) =>
          handleAddVariant(brand, model, newLabel, onChange)
        }
        itemActions={
          isAdmin && !!brand && !!model
            ? (optionValue, optionLabel) => (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteVariant(
                      brand,
                      model,
                      optionValue,
                      currentFormData,
                      onChange
                    );
                  }}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full cursor-pointer"
                  title={`Hapus varian ${optionLabel}`}
                  disabled={isMutatingCarData}
                >
                  <Trash2 size={14} />
                </button>
              )
            : undefined
        }
        {...commonSelectProps}
        disabled={
          commonSelectProps.disabled ||
          !model ||
          (variantOptions.length === 0 && !isAdmin && !!model)
        }
      />
    </div>
  );
};

export default CarBrands;
