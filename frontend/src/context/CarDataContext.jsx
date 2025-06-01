// frontend/src/context/CarDataContext.jsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import useSWR from "swr";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";

const CarDataContext = createContext(undefined);

export const useCarData = () => {
  const context = useContext(CarDataContext);
  if (!context) {
    throw new Error("useCarData must be used within a CarDataProvider");
  }
  return context;
};

const fetcher = (url) =>
  axiosInstance.get(url).then((res) => res.data?.data || []);
const CAR_DATA_API_ENDPOINT = "/api/car-data";

export const CarDataProvider = ({ children }) => {
  const {
    data: allCarData = [],
    error: carDataError,
    isLoading: isLoadingAllCarData,
    mutate: mutateCarData,
  } = useSWR(`${CAR_DATA_API_ENDPOINT}/all-data`, fetcher, {
    revalidateOnFocus: false,
  });

  const [isMutating, setIsMutating] = useState(false);

  const showToastError = (message, apiError) => {
    const errorMessage =
      apiError?.response?.data?.message || apiError?.message || message;
    toast.error(errorMessage, { className: "custom-toast" });
  };

  const handleAddBrand = useCallback(
    async (newBrandLabel, formOnChange) => {
      const normalizedNewBrandLabel = newBrandLabel.trim();
      if (!normalizedNewBrandLabel) return;

      if (
        allCarData.find(
          (b) =>
            b.brandName.toLowerCase() === normalizedNewBrandLabel.toLowerCase()
        )
      ) {
        formOnChange("brand", normalizedNewBrandLabel);
        formOnChange("model", "");
        formOnChange("variant", "");
        return;
      }

      setIsMutating(true);
      try {
        const response = await axiosInstance.post(
          `${CAR_DATA_API_ENDPOINT}/brands`,
          {
            name: normalizedNewBrandLabel,
            imgUrl: "/images/Carbrand/default.png",
          }
        );
        if (response.data?.success) {
          await mutateCarData();
          formOnChange("brand", normalizedNewBrandLabel);
          formOnChange("model", "");
          formOnChange("variant", "");
          toast.success(
            `Merek "${normalizedNewBrandLabel}" berhasil ditambahkan.`,
            { className: "custom-toast" }
          );
        } else {
          showToastError("Gagal menambahkan merek.", response);
        }
      } catch (apiError) {
        showToastError("Error API saat menambahkan merek.", apiError);
      } finally {
        setIsMutating(false);
      }
    },
    [allCarData, mutateCarData]
  );

  const handleAddModel = useCallback(
    async (currentBrand, newModelLabel, formOnChange) => {
      const normalizedNewModelLabel = newModelLabel.trim();
      if (!currentBrand || !normalizedNewModelLabel) return;

      const currentBrandData = allCarData.find(
        (b) => b.brandName === currentBrand
      );
      if (
        currentBrandData?.models?.find(
          (m) => m.name.toLowerCase() === normalizedNewModelLabel.toLowerCase()
        )
      ) {
        formOnChange("model", normalizedNewModelLabel);
        formOnChange("variant", "");
        return;
      }

      setIsMutating(true);
      try {
        const response = await axiosInstance.post(
          `${CAR_DATA_API_ENDPOINT}/models`,
          {
            brandName: currentBrand,
            modelName: normalizedNewModelLabel,
          }
        );
        if (response.data?.success) {
          await mutateCarData();
          formOnChange("model", normalizedNewModelLabel);
          formOnChange("variant", "");
          toast.success(
            `Model "${normalizedNewModelLabel}" berhasil ditambahkan ke merek "${currentBrand}".`,
            { className: "custom-toast" }
          );
        } else {
          showToastError("Gagal menambahkan model.", response);
        }
      } catch (apiError) {
        showToastError("Error API saat menambahkan model.", apiError);
      } finally {
        setIsMutating(false);
      }
    },
    [allCarData, mutateCarData]
  );

  const handleAddVariant = useCallback(
    async (currentBrand, currentModel, newVariantLabel, formOnChange) => {
      const normalizedNewVariantLabel = newVariantLabel.trim();
      if (!currentBrand || !currentModel || !normalizedNewVariantLabel) return;

      const currentBrandData = allCarData.find(
        (b) => b.brandName === currentBrand
      );
      const currentModelData = currentBrandData?.models?.find(
        (m) => m.name === currentModel
      );
      if (
        currentModelData?.variants?.find(
          (v) =>
            v.name.toLowerCase() === normalizedNewVariantLabel.toLowerCase()
        )
      ) {
        formOnChange("variant", normalizedNewVariantLabel);
        return;
      }

      setIsMutating(true);
      try {
        const response = await axiosInstance.post(
          `${CAR_DATA_API_ENDPOINT}/variants`,
          {
            brandName: currentBrand,
            modelName: currentModel,
            variantName: normalizedNewVariantLabel,
          }
        );
        if (response.data?.success) {
          await mutateCarData();
          formOnChange("variant", normalizedNewVariantLabel);
          toast.success(
            `Varian "${normalizedNewVariantLabel}" berhasil ditambahkan ke model "${currentModel}".`,
            { className: "custom-toast" }
          );
        } else {
          showToastError("Gagal menambahkan varian.", response);
        }
      } catch (apiError) {
        showToastError("Error API saat menambahkan varian.", apiError);
      } finally {
        setIsMutating(false);
      }
    },
    [allCarData, mutateCarData]
  );

  const handleDeleteBrand = useCallback(
    async (brandNameToDelete, currentFormData, formOnChange) => {
      if (!brandNameToDelete) return;
      if (
        window.confirm(
          `Anda yakin ingin menghapus merek "${brandNameToDelete}"? Ini juga akan menghapus semua model dan variannya.`
        )
      ) {
        setIsMutating(true);
        try {
          const response = await axiosInstance.delete(
            `${CAR_DATA_API_ENDPOINT}/brands`,
            {
              data: { brandName: brandNameToDelete },
            }
          );
          if (response.data?.success) {
            toast.success(
              response.data.message ||
                `Merek "${brandNameToDelete}" berhasil dihapus.`,
              { className: "custom-toast" }
            );
            await mutateCarData();
            if (currentFormData.brand === brandNameToDelete) {
              formOnChange("brand", "");
              formOnChange("model", "");
              formOnChange("variant", "");
            }
          } else {
            showToastError("Gagal menghapus merek.", response);
          }
        } catch (apiError) {
          showToastError("Error API saat menghapus merek.", apiError);
        } finally {
          setIsMutating(false);
        }
      }
    },
    [mutateCarData]
  );

  const handleDeleteModel = useCallback(
    async (currentBrand, modelToDelete, currentFormData, formOnChange) => {
      if (!currentBrand || !modelToDelete) return;
      if (
        window.confirm(
          `Anda yakin ingin menghapus model "${modelToDelete}" dari merek "${currentBrand}"? Ini juga akan menghapus semua variannya.`
        )
      ) {
        setIsMutating(true);
        try {
          const response = await axiosInstance.delete(
            `${CAR_DATA_API_ENDPOINT}/models`,
            {
              data: { brandName: currentBrand, modelName: modelToDelete },
            }
          );
          if (response.data?.success) {
            toast.success(response.data.message || "Model berhasil dihapus.", {
              className: "custom-toast",
            });
            await mutateCarData();
            if (
              currentFormData.brand === currentBrand &&
              currentFormData.model === modelToDelete
            ) {
              formOnChange("model", "");
              formOnChange("variant", "");
            }
          } else {
            showToastError("Gagal menghapus model.", response);
          }
        } catch (apiError) {
          showToastError("Error API saat menghapus model.", apiError);
        } finally {
          setIsMutating(false);
        }
      }
    },
    [mutateCarData]
  );

  const handleDeleteVariant = useCallback(
    async (
      currentBrand,
      currentModel,
      variantToDelete,
      currentFormData,
      formOnChange
    ) => {
      if (!currentBrand || !currentModel || !variantToDelete) return;
      if (
        window.confirm(
          `Anda yakin ingin menghapus varian "${variantToDelete}" dari model "${currentModel}"?`
        )
      ) {
        setIsMutating(true);
        try {
          const response = await axiosInstance.delete(
            `${CAR_DATA_API_ENDPOINT}/variants`,
            {
              data: {
                brandName: currentBrand,
                modelName: currentModel,
                variantName: variantToDelete,
              },
            }
          );
          if (response.data?.success) {
            toast.success(response.data.message || "Varian berhasil dihapus.", {
              className: "custom-toast",
            });
            await mutateCarData();
            if (
              currentFormData.brand === currentBrand &&
              currentFormData.model === currentModel &&
              currentFormData.variant === variantToDelete
            ) {
              formOnChange("variant", "");
            }
          } else {
            showToastError("Gagal menghapus varian.", response);
          }
        } catch (apiError) {
          showToastError("Error API saat menghapus varian.", apiError);
        } finally {
          setIsMutating(false);
        }
      }
    },
    [mutateCarData]
  );

  const contextValue = useMemo(
    () => ({
      allCarData,
      carDataError,
      isLoadingAllCarData,
      isMutatingCarData: isMutating,
      mutateCarData,
      handleAddBrand,
      handleAddModel,
      handleAddVariant,
      handleDeleteBrand,
      handleDeleteModel,
      handleDeleteVariant,
    }),
    [
      allCarData,
      carDataError,
      isLoadingAllCarData,
      isMutating,
      mutateCarData,
      handleAddBrand,
      handleAddModel,
      handleAddVariant,
      handleDeleteBrand,
      handleDeleteModel,
      handleDeleteVariant,
    ]
  );

  return (
    <CarDataContext.Provider value={contextValue}>
      {children}
    </CarDataContext.Provider>
  );
};
