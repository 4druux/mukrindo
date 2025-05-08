// EditProduct.jsx
"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

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
import carData from "@/utils/carData";

// Import Hooks
import useAutoAdvanceFocus from "@/hooks/useAutoAdvanceFocus";

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

  const API_ENDPOINT = "http://localhost:5000/api/products";

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
        delay: INACTIVITY_DELAY,
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

    if (wasPreviouslyEmpty && updatedValue) {
      handleAutoAdvance(name, updatedValue);
    }
  };

  const handleBrandChange = (field, value, modelValue, variantValue) => {
    const wasPreviouslyEmpty = !productData[field];
    setProductData((prev) => ({
      ...prev,
      brand: field === "brand" ? value : prev.brand,
      model: field === "model" ? value : field === "brand" ? "" : modelValue,
      variant:
        field === "variant"
          ? value
          : field === "brand" || field === "model"
          ? ""
          : variantValue,
    }));

    if (errors.brand || errors.model || errors.variant) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.brand;
        delete newErrors.model;
        delete newErrors.variant;
        return newErrors;
      });
    }

    if (wasPreviouslyEmpty && value) {
      handleAutoAdvance(field, value);
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

          const initialFiles = await Promise.all(
            (data.images || []).map(async (base64, index) => {
              try {
                const response = await fetch(base64);
                const blob = await response.blob();
                const file = new File([blob], `image${index}.jpg`, {
                  type: blob.type || "image/jpeg",
                });

                return {
                  original: file,
                  cropped: file,
                  originalBase64: base64,
                };
              } catch (fetchError) {
                console.error("Error fetching image blob:", fetchError);
                return null;
              }
            })
          ).then((files) => files.filter((file) => file !== null));

          setMediaFiles(initialFiles);

          initialProductData.current = { ...fetchedData };
          initialMediaFiles.current = [...initialFiles];
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
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoadingUpdate(true);

    try {
      const base64Images = await Promise.all(
        mediaFiles.map(async (fileObj) => {
          if (
            fileObj.cropped &&
            fileObj.cropped instanceof Blob &&
            fileObj.cropped !== fileObj.original
          ) {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = (error) =>
                reject(new Error("Gagal membaca file gambar: " + error));
              reader.readAsDataURL(fileObj.cropped);
            });
          } else if (fileObj.originalBase64) {
            return fileObj.originalBase64;
          } else if (fileObj.cropped && fileObj.cropped instanceof Blob) {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = (error) =>
                reject(new Error("Gagal membaca file gambar baru: " + error));
              reader.readAsDataURL(fileObj.cropped);
            });
          } else {
            console.warn("Skipping invalid file object:", fileObj);
            return null;
          }
        })
      ).then((images) => images.filter((img) => img !== null));

      const submitData = {
        ...productData,
        images: base64Images,
      };

      const response = await axios.put(
        `${API_ENDPOINT}/${productId}`,
        submitData
      );

      toast.success("Produk berhasil diperbarui.", {
        className: "custom-toast",
      });

      mutateProducts();
      initialProductData.current = { ...productData };
      initialMediaFiles.current = [...mediaFiles.map((f) => ({ ...f }))];

      router.push("/admin/produk");
    } catch (error) {
      console.error("Error updating product:", error);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
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
    { label: "Produk", href: "/admin/produk" },
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
            carData={carData}
            brand={productData.brand}
            model={productData.model}
            variant={productData.variant}
            onChange={handleBrandChange}
            errors={errors}
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
            title=" Warna Mobil"
            description="Pilih Warna Mobil"
            options={carColorOptions}
            value={productData.carColor}
            onChange={(value) =>
              handleChange({ target: { name: "carColor", value } })
            }
            error={errors.carColor}
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
