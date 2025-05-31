// frontend/src/components/product-admin/CarBrands.jsx
"use client";
import { useMemo } from "react";
import Select from "../common/Select";
import axiosInstance from "@/utils/axiosInstance";
import useSWR from "swr";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const fetcher = (url) =>
  axiosInstance.get(url).then((res) => res.data?.data || []);

const CarBrands = ({
  brand,
  model,
  variant,
  onChange,
  errors, // Prop errors dari form utama, mungkin tidak lagi terlalu relevan di sini jika validasi utama di parent
  brandRef,
  modelRef,
  variantRef,
  isAdmin = false,
}) => {
  const {
    data: allCarData = [],
    error: carDataError,
    isLoading: isLoadingAllCarData,
    mutate: mutateCarData,
  } = useSWR(isAdmin ? "/api/car-data/all-data" : null, fetcher, {
    revalidateOnFocus: true,
  });

  const brandOptions = useMemo(
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

  const handleAddBrand = async (newBrandLabel) => {
    const normalizedNewBrandLabel = newBrandLabel.trim();
    if (
      isAdmin &&
      normalizedNewBrandLabel &&
      !allCarData.find(
        (b) =>
          b.brandName.toLowerCase() === normalizedNewBrandLabel.toLowerCase()
      )
    ) {
      try {
        const response = await axiosInstance.post("/api/car-data/brands", {
          name: normalizedNewBrandLabel,
          imgUrl: "/images/Carbrand/default.png",
        });
        if (response.data && response.data.success) {
          await mutateCarData();
          onChange("brand", normalizedNewBrandLabel);
          onChange("model", "");
          onChange("variant", "");
          // toast.success(`Merek "${normalizedNewBrandLabel}" berhasil ditambahkan.`, { className: "custom-toast" }); // Opsional
        } else {
          toast.error(
            `Gagal menambahkan merek: ${
              response.data?.message || "Error tidak diketahui"
            }`,
            { className: "custom-toast" }
          );
        }
      } catch (apiError) {
        toast.error(
          `Error API saat menambahkan merek: ${
            apiError.response?.data?.message || apiError.message
          }`,
          { className: "custom-toast" }
        );
      }
    }
  };

  const handleAddModel = async (newModelLabel) => {
    const normalizedNewModelLabel = newModelLabel.trim();
    if (isAdmin && brand && normalizedNewModelLabel) {
      const currentBrandData = allCarData.find((b) => b.brandName === brand);
      if (
        currentBrandData &&
        currentBrandData.models?.find(
          (m) => m.name.toLowerCase() === normalizedNewModelLabel.toLowerCase()
        )
      ) {
        onChange("model", normalizedNewModelLabel);
        onChange("variant", "");
        return;
      }
      try {
        const response = await axiosInstance.post("/api/car-data/models", {
          brandName: brand,
          modelName: normalizedNewModelLabel,
        });
        if (response.data && response.data.success) {
          await mutateCarData();
          onChange("model", normalizedNewModelLabel);
          onChange("variant", "");
        } else {
          toast.error(
            `Gagal menambahkan model: ${
              response.data?.message || "Error tidak diketahui"
            }`,
            { className: "custom-toast" }
          );
        }
      } catch (apiError) {
        toast.error(
          `Error API saat menambahkan model: ${
            apiError.response?.data?.message || apiError.message
          }`,
          { className: "custom-toast" }
        );
      }
    } else if (isAdmin && !brand) {
      toast.error("Pilih merek terlebih dahulu sebelum menambahkan model.", {
        className: "custom-toast",
      });
    }
  };

  const handleAddVariant = async (newVariantLabel) => {
    const normalizedNewVariantLabel = newVariantLabel.trim();
    if (isAdmin && brand && model && normalizedNewVariantLabel) {
      const currentBrandData = allCarData.find((b) => b.brandName === brand);
      const currentModelData = currentBrandData?.models?.find(
        (m) => m.name === model
      );
      if (
        currentModelData &&
        currentModelData.variants?.find(
          (v) =>
            v.name.toLowerCase() === normalizedNewVariantLabel.toLowerCase()
        )
      ) {
        onChange("variant", normalizedNewVariantLabel);
        return;
      }
      try {
        const response = await axiosInstance.post("/api/car-data/variants", {
          brandName: brand,
          modelName: model,
          variantName: normalizedNewVariantLabel,
        });
        if (response.data && response.data.success) {
          await mutateCarData();
          onChange("variant", normalizedNewVariantLabel);
        } else {
          toast.error(
            `Gagal menambahkan varian: ${
              response.data?.message || "Error tidak diketahui"
            }`,
            { className: "custom-toast" }
          );
        }
      } catch (apiError) {
        toast.error(
          `Error API saat menambahkan varian: ${
            apiError.response?.data?.message || apiError.message
          }`,
          { className: "custom-toast" }
        );
      }
    } else if (isAdmin && (!brand || !model)) {
      toast.error(
        "Pilih merek dan model terlebih dahulu sebelum menambahkan varian.",
        { className: "custom-toast" }
      );
    }
  };

  const handleDeleteModel = async (modelNameToDelete) => {
    if (!isAdmin || !brand || !modelNameToDelete) return;
    if (
      window.confirm(
        `Anda yakin ingin menghapus model "${modelNameToDelete}" dari merek "${brand}"? Ini juga akan menghapus semua variannya.`
      )
    ) {
      try {
        const response = await axiosInstance.delete("/api/car-data/models", {
          data: { brandName: brand, modelName: modelNameToDelete },
        });
        if (response.data && response.data.success) {
          toast.success(response.data.message || "Model berhasil dihapus.", {
            className: "custom-toast",
          });
          await mutateCarData();
          if (model === modelNameToDelete) {
            onChange("model", "");
            onChange("variant", "");
          }
        } else {
          toast.error(
            `Gagal menghapus model: ${response.data?.message || "Error"}`,
            { className: "custom-toast" }
          );
        }
      } catch (apiError) {
        toast.error(
          `Error API saat menghapus model: ${
            apiError.response?.data?.message || apiError.message
          }`,
          { className: "custom-toast" }
        );
      }
    }
  };

  const handleDeleteVariant = async (variantNameToDelete) => {
    if (!isAdmin || !brand || !model || !variantNameToDelete) return;
    if (
      window.confirm(
        `Anda yakin ingin menghapus varian "${variantNameToDelete}" dari model "${model}"?`
      )
    ) {
      try {
        const response = await axiosInstance.delete("/api/car-data/variants", {
          data: {
            brandName: brand,
            modelName: model,
            variantName: variantNameToDelete,
          },
        });
        if (response.data && response.data.success) {
          toast.success(response.data.message || "Varian berhasil dihapus.", {
            className: "custom-toast",
          });
          await mutateCarData();
          if (variant === variantNameToDelete) {
            onChange("variant", "");
          }
        } else {
          toast.error(
            `Gagal menghapus varian: ${response.data?.message || "Error"}`,
            { className: "custom-toast" }
          );
        }
      } catch (apiError) {
        toast.error(
          `Error API saat menghapus varian: ${
            apiError.response?.data?.message || apiError.message
          }`,
          { className: "custom-toast" }
        );
      }
    }
  };

  if (isAdmin && carDataError) {
    return (
      <div className="text-red-500 col-span-3 p-4 border border-red-300 rounded-md bg-red-50">
        Gagal memuat data master mobil:{" "}
        {carDataError.response?.data?.message ||
          carDataError.message ||
          "Cek koneksi backend atau endpoint API."}
        <br />
        Pastikan endpoint <strong>/api/car-data/all-data</strong> sudah benar
        dan backend berjalan.
      </div>
    );
  }

  const isLoadingOptions = isAdmin && isLoadingAllCarData;

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
        searchOption={true}
        allowAdd={isAdmin}
        onAddOption={handleAddBrand}
        disabled={
          isLoadingOptions ||
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
        searchOption={true}
        disabled={
          isLoadingOptions ||
          !brand ||
          (modelOptions.length === 0 && !isAdmin && !!brand)
        }
        allowAdd={isAdmin && !!brand}
        onAddOption={handleAddModel}
        itemActions={
          isAdmin && !!brand
            ? (optionValue, optionLabel) => (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteModel(optionValue);
                  }}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full cursor-pointer"
                  title={`Hapus model ${optionLabel}`}
                >
                  <Trash2 size={14} />
                </button>
              )
            : undefined
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
        searchOption={true}
        disabled={
          isLoadingOptions ||
          !model ||
          (variantOptions.length === 0 && !isAdmin && !!model)
        }
        allowAdd={isAdmin && !!brand && !!model}
        onAddOption={handleAddVariant}
        itemActions={
          isAdmin && !!brand && !!model
            ? (optionValue, optionLabel) => (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteVariant(optionValue);
                  }}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full cursor-pointer"
                  title={`Hapus varian ${optionLabel}`}
                >
                  <Trash2 size={14} />
                </button>
              )
            : undefined
        }
      />
    </div>
  );
};

export default CarBrands;
