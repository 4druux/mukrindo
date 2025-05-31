// EditProduct.jsx
"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";

// Import Components
import { useProducts } from "@/context/ProductContext";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import ImageUpload from "@/components/product-admin/ImageUpload";
import CarBrands from "@/components/product-admin/CarBrands";
import CarSystems from "@/components/product-admin/CarSystems";
import CarPapers from "@/components/product-admin/CarPapers";
import SkeletonEditProduct from "@/components/skeleton/skeleton-admin/SkeletonEditProduct";

// Import Utils
import { validateProductData } from "@/utils/validateProductData";
import { formatNumber, unformatNumber } from "@/utils/formatNumber";
import { carColorOptions } from "@/utils/carColorOptions";

// Import Hooks
import useAutoAdvanceFocus from "@/hooks/useAutoAdvanceFocus";
import DotLoader from "@/components/common/DotLoader";

const QUICK_OPEN_DELAY = 50;
const INACTIVITY_DELAY = 10000;

const EditProduct = ({ productId }) => {
  const [productData, setProductData] = useState({
    carName: "",
    brand: "",
    model: "",
    variant: "",
    type: "",
    numberOfSeats: "",
    carColor: "",
    cc: "",
    travelDistance: "",
    driveSystem: "",
    transmission: "",
    fuelType: "",
    stnkExpiry: "",
    plateNumber: "",
    yearOfAssembly: "",
    price: "",
    status: "",
  });

  // Refs auto focus/open
  const carNameInputRef = useRef(null);
  const brandSelectRef = useRef(null);
  const modelSelectRef = useRef(null);
  const variantSelectRef = useRef(null);
  const typeSelectRef = useRef(null);
  const numberOfSeatsSelectRef = useRef(null);
  const carColorSelectRef = useRef(null);
  const ccInputRef = useRef(null);
  const travelDistanceInputRef = useRef(null);
  const driveSystemSelectRef = useRef(null);
  const transmissionSelectRef = useRef(null);
  const fuelTypeSelectRef = useRef(null);
  const stnkExpiryInputRef = useRef(null);
  const plateNumberSelectRef = useRef(null);
  const yearOfAssemblySelectRef = useRef(null);
  const priceInputRef = useRef(null);

  const [mediaFiles, setMediaFiles] = useState([]);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const { fetchProductById, mutateProducts } = useProducts();

  const initialProductData = useRef(null);
  const initialMediaFiles = useRef(null);

  const API_ENDPOINT = "/api/products";

  const allRefs = useMemo(
    () => ({
      carName: carNameInputRef,
      brand: brandSelectRef,
      model: modelSelectRef,
      variant: variantSelectRef,
      type: typeSelectRef,
      numberOfSeats: numberOfSeatsSelectRef,
      carColor: carColorSelectRef,
      cc: ccInputRef,
      travelDistance: travelDistanceInputRef,
      driveSystem: driveSystemSelectRef,
      transmission: transmissionSelectRef,
      fuelType: fuelTypeSelectRef,
      stnkExpiry: stnkExpiryInputRef,
      plateNumber: plateNumberSelectRef,
      yearOfAssembly: yearOfAssemblySelectRef,
      price: priceInputRef,
    }),
    []
  );

  const addProductTransitions = useMemo(
    () => ({
      carName: {
        target: "brand",
        action: "openDropdown",
        delay: INACTIVITY_DELAY,
        type: "inactivity",
      },
      brand: {
        target: "model",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      model: {
        target: "variant",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      variant: {
        target: "type",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      type: {
        target: "numberOfSeats",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      numberOfSeats: {
        target: "carColor",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      carColor: {
        target: "cc",
        action: "focus",
        delay: QUICK_OPEN_DELAY,
        type: "inactivity",
      },
      cc: {
        target: "travelDistance",
        action: "focus",
        delay: INACTIVITY_DELAY,
        type: "inactivity",
      },
      travelDistance: {
        target: "driveSystem",
        action: "openDropdown",
        delay: INACTIVITY_DELAY,
        type: "inactivity",
      },
      driveSystem: {
        target: "transmission",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      transmission: {
        target: "fuelType",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      fuelType: {
        target: "stnkExpiry",
        action: "focus",
        delay: QUICK_OPEN_DELAY,
      },
      stnkExpiry: {
        target: "plateNumber",
        action: "openDropdown",
        delay: INACTIVITY_DELAY,
        type: "inactivity",
      },
      plateNumber: {
        target: "yearOfAssembly",
        action: "openDropdown",
        delay: QUICK_OPEN_DELAY,
      },
      yearOfAssembly: {
        target: "price",
        action: "focus",
        delay: QUICK_OPEN_DELAY,
      },
    }),
    []
  );

  const { handleAutoAdvance } = useAutoAdvanceFocus(
    allRefs,
    addProductTransitions
  );

  const clearErrorOnChange = (name) => {
    if (errors[name]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const wasPreviouslyEmpty = !productData[name];
    let updatedValue = value;
    if (name === "price" || name === "cc" || name === "travelDistance") {
      updatedValue = unformatNumber(value);
    }
    setProductData((prevData) => ({
      ...prevData,
      [name]: updatedValue,
    }));
    clearErrorOnChange(name);

    if (wasPreviouslyEmpty && updatedValue && allRefs[name]) {
      handleAutoAdvance(name, updatedValue);
    }
  };

  const handleBrandModelVariantChange = (fieldName, value) => {
    const wasPreviouslyEmpty = !productData[fieldName];
    setProductData((prev) => {
      const newData = { ...prev, [fieldName]: value };
      if (fieldName === "brand") {
        newData.model = "";
        newData.variant = "";
      } else if (fieldName === "model") {
        newData.variant = "";
      }
      return newData;
    });

    if (errors[fieldName]) {
      clearErrorOnChange(fieldName);
    }
    if (wasPreviouslyEmpty && value && allRefs[fieldName]) {
      handleAutoAdvance(fieldName, value);
    }
  };

  const handleMediaFilesChange = (newFiles) => {
    setMediaFiles(newFiles);
    clearErrorOnChange("mediaFiles");
  };

  useEffect(() => {
    const fetchInitialProduct = async () => {
      if (!productId) {
        setLoadingFetch(false);
        setSubmitError("Product ID tidak ditemukan.");
        return;
      }
      setLoadingFetch(true);
      setSubmitError(null);
      setErrors({});
      try {
        const result = await fetchProductById(productId);
        if (result.success) {
          const data = result.data;
          const fetchedData = {
            carName: data.carName || "",
            brand: data.brand || "",
            model: data.model || "",
            variant: data.variant || "",
            type: data.type || "",
            numberOfSeats: data.numberOfSeats || "",
            carColor: data.carColor || "",
            cc: data.cc || "",
            travelDistance: data.travelDistance || "",
            driveSystem: data.driveSystem || "",
            transmission: data.transmission || "",
            fuelType: data.fuelType || "",
            stnkExpiry: data.stnkExpiry || "",
            plateNumber: data.plateNumber || "",
            yearOfAssembly: data.yearOfAssembly || "",
            price: data.price || "",
            status: data.status || "Tersedia",
          };
          setProductData(fetchedData);

          const initialFilesPromises = (data.images || []).map(
            async (imageUrl, index) => {
              if (
                typeof imageUrl !== "string" ||
                !imageUrl.trim().startsWith("http")
              ) {
                console.warn(
                  `Invalid image URL at index ${index} for product ${productId}:`,
                  imageUrl
                );
                return null;
              }
              try {
                const response = await fetch(imageUrl);
                if (!response.ok) {
                  console.error(
                    `Failed to fetch image ${imageUrl} for product ${productId}: ${response.status} ${response.statusText}`
                  );
                  return null;
                }
                const blob = await response.blob();
                if (!blob || blob.size === 0) {
                  console.warn(
                    `Fetched empty or invalid blob for image ${imageUrl} (product ${productId}). Blob type: ${blob?.type}, size: ${blob?.size}`
                  );
                  return null;
                }

                const originalNameFromServer = imageUrl.substring(
                  imageUrl.lastIndexOf("/") + 1
                );
                const safeOriginalName =
                  originalNameFromServer.replace(/[^\w.-]/g, "_") ||
                  `image${index}.jpg`;

                const file = new File([blob], safeOriginalName, {
                  type: blob.type || "image/jpeg",
                });

                return {
                  original: file,
                  cropped: file,
                  originalBase64: imageUrl,
                };
              } catch (fetchError) {
                console.error(
                  `Error processing image URL ${imageUrl} for product ${productId}:`,
                  fetchError
                );
                return null;
              }
            }
          );

          const processedInitialFiles = (
            await Promise.all(initialFilesPromises)
          ).filter((file) => file !== null);

          setMediaFiles(processedInitialFiles);
          initialProductData.current = { ...fetchedData };
          initialMediaFiles.current = [...processedInitialFiles];
        } else {
          setSubmitError(result.error || "Gagal memuat data produk.");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setSubmitError(error.message || "Terjadi kesalahan saat memuat data.");
      } finally {
        setLoadingFetch(false);
      }
    };
    fetchInitialProduct();
  }, [productId, fetchProductById]);

  const isChanged = useMemo(() => {
    if (!initialProductData.current || !initialMediaFiles.current) {
      return false;
    }

    const productDataChanged = Object.keys(productData).some(
      (key) => productData[key] !== initialProductData.current[key]
    );

    const mediaFilesChanged =
      mediaFiles.length !== initialMediaFiles.current.length ||
      mediaFiles.some((currentFileObj, index) => {
        const initialFileObj = initialMediaFiles.current[index];
        if (!initialFileObj) return true;

        if (!currentFileObj.originalBase64 && initialFileObj.originalBase64)
          return true;
        if (currentFileObj.originalBase64 && !initialFileObj.originalBase64)
          return true;
        if (
          currentFileObj.original?.name !== initialFileObj.original?.name ||
          currentFileObj.original?.size !== initialFileObj.original?.size
        )
          return true;
        if (
          currentFileObj.cropped !== currentFileObj.original &&
          initialFileObj.cropped === initialFileObj.original
        )
          return true;

        return false;
      });

    return productDataChanged || mediaFilesChanged;
  }, [productData, mediaFiles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});

    const validationErrors = validateProductData(productData, mediaFiles);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Harap periksa kembali data yang Anda masukkan.", {
        className: "custom-toast",
      });
      const firstErrorKey = Object.keys(validationErrors)[0];
      const errorElement = document.getElementById(firstErrorKey);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (!isChanged) {
      toast.error("Tidak ada perubahan data untuk disimpan.", {
        className: "custom-toast",
      });
      return;
    }

    setLoadingUpdate(true);

    const formDataToSend = new FormData();
    Object.keys(productData).forEach((key) => {
      if (productData[key] !== undefined && productData[key] !== null) {
        formDataToSend.append(key, productData[key]);
      }
    });

    const newFilesToUpload = [];
    const retainedImageUrls = [];

    mediaFiles.forEach((fileObj) => {
      if (fileObj.cropped instanceof File || fileObj.cropped instanceof Blob) {
        newFilesToUpload.push({
          file: fileObj.cropped,
          name: fileObj.original?.name || `image-edited-${Date.now()}.jpg`,
        });
      } else if (
        typeof fileObj.cropped === "string" &&
        fileObj.cropped.startsWith("http")
      ) {
        retainedImageUrls.push(fileObj.cropped);
      } else if (
        fileObj.originalBase64 &&
        typeof fileObj.originalBase64 === "string" &&
        fileObj.originalBase64.startsWith("http")
      ) {
        retainedImageUrls.push(fileObj.originalBase64);
      }
    });

    if (retainedImageUrls.length > 0) {
      retainedImageUrls.forEach((url) =>
        formDataToSend.append("existingImages", url)
      );
    } else {
      formDataToSend.append("existingImages", JSON.stringify([]));
    }

    newFilesToUpload.forEach((fileData) => {
      formDataToSend.append("images", fileData.file, fileData.name);
    });

    try {
      const response = await axiosInstance.put(
        `${API_ENDPOINT}/${productId}`,
        formDataToSend,
        {
          headers: {},
        }
      );

      toast.success("Produk berhasil diperbarui.", {
        className: "custom-toast",
      });

      mutateProducts();

      if (
        response.data &&
        response.data.product &&
        response.data.product.images
      ) {
        const updatedCloudImages = response.data.product.images.map((url) => ({
          original: null,
          cropped: url,
          originalBase64: url,
        }));
        setMediaFiles(updatedCloudImages);
        initialMediaFiles.current = [...updatedCloudImages];
      }
      initialProductData.current = { ...productData };

      router.push("/admin/produk");
    } catch (error) {
      console.error(
        "Error updating product:",
        error.response?.data || error.message || error
      );
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal memperbarui produk. Silakan coba lagi.";
      setSubmitError(errorMessage);
      toast.error(errorMessage, {
        className: "custom-toast",
      });
      setLoadingUpdate(false);
    }
  };

  if (loadingFetch) {
    return <SkeletonEditProduct />;
  }

  if (loadingUpdate) {
    return (
      <div className="flex items-center justify-center h-[80vh] bg-gray-50">
        <DotLoader dotSize="w-5 h-5" />
      </div>
    );
  }

  if (
    !loadingFetch &&
    submitError &&
    !Object.keys(productData).some((key) => productData[key])
  ) {
    return <div className="text-center p-4 text-red-500">{submitError}</div>;
  }

  const breadcrumbItems = [
    { label: "Beranda", href: "/admin" },
    { label: "Katalog Produk", href: "/admin/produk" },
    { label: "Edit Produk", href: "" },
  ];

  return (
    <div>
      <BreadcrumbNav items={breadcrumbItems} />

      <div className="p-4 md:p-6 rounded-xl shadow-lg bg-white">
        <h1 className="text-lg lg:text-xl font-medium text-gray-700 mb-2 md:mb-4">
          Edit Produk Mobil
        </h1>

        {submitError && <div className="text-red-500 mb-4">{submitError}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">
              Gambar Mobil
            </label>
            <ImageUpload
              mediaFiles={mediaFiles}
              setMediaFiles={handleMediaFilesChange}
              error={errors.mediaFiles}
            />
          </div>

          <Input
            ref={carNameInputRef}
            label="Nama Mobil"
            id="carName"
            name="carName"
            placeholderTexts={[
              "Contoh: Toyota Avanza G 2021 Bekas",
              "Contoh: Honda Brio Satya E CVT 2022",
              "Contoh: Mitsubishi Xpander Ultimate 2019",
            ]}
            value={productData.carName}
            onChange={handleChange}
            error={errors.carName}
          />

          <CarBrands
            brandRef={brandSelectRef}
            modelRef={modelSelectRef}
            variantRef={variantSelectRef}
            brand={productData.brand}
            model={productData.model}
            variant={productData.variant}
            onChange={handleBrandModelVariantChange}
            errors={errors}
            isAdmin={true}
          />

          <Select
            ref={typeSelectRef}
            label="Tipe Mobil"
            id="type"
            name="type"
            value={productData.type}
            title="Tipe Mobil"
            description="Jenis Tipe Mobil"
            error={errors.type}
            onChange={(value) =>
              handleChange({ target: { name: "type", value } })
            }
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

          <Select
            ref={numberOfSeatsSelectRef}
            label="Kapasitas Tempat Duduk"
            id="numberOfSeats"
            name="numberOfSeats"
            title="Kapasitas Tempat Duduk"
            description="Kapasitas Tempat Duduk Mobil"
            value={productData.numberOfSeats}
            onChange={(value) =>
              handleChange({ target: { name: "numberOfSeats", value } })
            }
            error={errors.numberOfSeats}
            options={[
              { value: "4", label: "4 Kursi" },
              { value: "5", label: "5 Kursi" },
              { value: "6", label: "6 Kursi" },
              { value: "7", label: "7 Kursi" },
              { value: "8", label: "8 Kursi" },
            ]}
          />

          <Select
            ref={carColorSelectRef}
            label="Warna Mobil"
            id="carColor"
            name="carColor"
            title="Warna Mobil"
            description="Pilih Warna Mobil"
            options={carColorOptions}
            value={productData.carColor}
            onChange={(value) =>
              handleChange({ target: { name: "carColor", value } })
            }
            error={errors.carColor}
            searchOption={true}
          />

          <Input
            ref={ccInputRef}
            label="Kapasitas Mesin (CC)"
            id="cc"
            name="cc"
            placeholderTexts={["Kapasitas mesin mobil anda"]}
            value={productData.cc}
            onChange={handleChange}
            formatter={formatNumber}
            error={errors.cc}
          />

          <Input
            ref={travelDistanceInputRef}
            label="Jarak Tempuh (KM)"
            id="travelDistance"
            name="travelDistance"
            inputMode="numeric"
            placeholderTexts={["Jarak tempuh mobil anda"]}
            value={productData.travelDistance}
            onChange={handleChange}
            formatter={formatNumber}
            error={errors.travelDistance}
          />

          <CarSystems
            driveSystemRef={driveSystemSelectRef}
            transmissionRef={transmissionSelectRef}
            fuelTypeRef={fuelTypeSelectRef}
            data={{
              driveSystem: productData.driveSystem,
              transmission: productData.transmission,
              fuelType: productData.fuelType,
            }}
            onChange={handleChange}
            errors={errors}
          />

          <CarPapers
            stnkExpiryRef={stnkExpiryInputRef}
            plateNumberRef={plateNumberSelectRef}
            yearOfAssemblyRef={yearOfAssemblySelectRef}
            data={{
              stnkExpiry: productData.stnkExpiry,
              plateNumber: productData.plateNumber,
              yearOfAssembly: productData.yearOfAssembly,
            }}
            onChange={handleChange}
            errors={errors}
          />

          <Input
            ref={priceInputRef}
            label="Harga Mobil"
            id="price"
            name="price"
            inputMode="numeric"
            value={productData.price}
            onChange={handleChange}
            formatter={formatNumber}
            error={errors.price}
            prefix="Rp "
          />

          <Select
            label="Status"
            id="status"
            name="status"
            value={productData.status}
            error={errors.status}
            onChange={(value) =>
              handleChange({ target: { name: "status", value } })
            }
            options={[
              { value: "Tersedia", label: "Tersedia" },
              { value: "Terjual", label: "Terjual" },
            ]}
          />

          {/* Buttons */}
          <div className="col-span-2 flex justify-end space-x-2 sm:space-x-4 mt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="cursor-pointer border text-orange-600 border-orange-500 hover:bg-orange-100 hover:border-orange-500 
              hover:text-orange-600 text-sm font-medium py-2.5 px-6 rounded-full"
              disabled={loadingUpdate}
            >
              Kembali
            </button>
            <button
              type="submit"
              className={`text-white text-sm font-medium py-2.5 px-6 rounded-full ${
                loadingUpdate
                  ? "bg-orange-500 opacity-55 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-400 to-orange-600 hover:bg-orange-600 hover:from-transparent hover:to-transparent cursor-pointer"
              }`}
              disabled={loadingUpdate}
            >
              {loadingUpdate ? "Memperbarui..." : "Perbarui Produk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
