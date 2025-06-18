// AddProduct.jsx
"use client";
import React, { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { motion } from "framer-motion";

// Import Components
import { useProducts } from "@/context/ProductContext";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import ImageUpload from "@/components/product-admin/ImageUpload";
import CarBrands from "@/components/product-admin/CarBrands";
import CarSystems from "@/components/product-admin/CarSystems";
import CarPapers from "@/components/product-admin/CarPapers";
import ButtonMagnetic from "@/components/common/ButtonMagnetic";

// Import Utils
import { validateProductData } from "@/utils/validateProductData";
import { formatNumber, unformatNumber } from "@/utils/formatNumber";
import { carColorOptions } from "@/utils/carColorOptions";
import { uploadMultipleImagesToCloudinary } from "@/utils/uploadCloudinary";

// Import Hooks
import useAutoAdvanceFocus from "@/hooks/useAutoAdvanceFocus";
import DotLoader from "@/components/common/DotLoader";
import TittleText from "@/components/common/TittleText";
import ButtonAction from "@/components/common/ButtonAction";

const QUICK_OPEN_DELAY = 50;
const INACTIVITY_DELAY = 10000;

const AddProduct = () => {
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
    status: "Tersedia",
  });

  // Refs auto open/focus
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
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });
  const [submitError, setSubmitError] = useState(null);
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const { mutateProducts } = useProducts();
  const API_ENDPOINT = "/products";

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

    setLoading(true);
    setUploadProgress({
      current: 0,
      total: mediaFiles.filter(
        (mf) => mf.cropped instanceof File || mf.cropped instanceof Blob
      ).length,
    });

    let uploadedImageUrls = [];
    try {
      const filesToUpload = mediaFiles
        .map((fileObj) => fileObj.cropped)
        .filter((file) => file instanceof File || file instanceof Blob);

      if (filesToUpload.length > 0) {
        uploadedImageUrls = await uploadMultipleImagesToCloudinary(
          filesToUpload,
          "mukrindo_products",
          (currentIndex, totalFiles) => {
            setUploadProgress({ current: currentIndex, total: totalFiles });
          }
        );
      }

      const productPayload = {
        ...productData,
        imageUrls: uploadedImageUrls,
      };

      const response = await axiosInstance.post(API_ENDPOINT, productPayload);
      toast.success("Produk berhasil ditambahkan.", {
        className: "custom-toast",
      });

      mutateProducts();

      setProductData({
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
        status: "Tersedia",
      });
      setMediaFiles([]);
      setErrors({});
      setSubmitError(null);

      router.push("/admin/produk");
    } catch (error) {
      console.error(
        "Error adding product:",
        error.response?.data || error.message || error
      );
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal menambahkan produk. Silakan coba lagi.";
      setSubmitError(errorMessage);
      toast.error(errorMessage, {
        className: "custom-toast",
      });
      setLoading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  if (
    loading &&
    uploadProgress.total > 0 &&
    uploadProgress.current < uploadProgress.total
  ) {
    return (
      <div className="flex items-center justify-center h-[80vh] bg-gray-50">
        <DotLoader
          dotSize="w-5 h-5"
          text={`Mengunggah gambar ${uploadProgress.current} dari ${uploadProgress.total}`}
        />
      </div>
    );
  }

  if (
    loading &&
    (!uploadProgress.total || uploadProgress.current === uploadProgress.total)
  ) {
    return (
      <div className="flex items-center justify-center h-[80vh] bg-gray-50">
        <DotLoader dotSize="w-5 h-5" text="Menyimpan produk..." />
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Beranda", href: "/admin" },
    { label: "Katalog Produk", href: "/admin/produk" },
    { label: "Tambah Produk", href: "" },
  ];

  const formContainerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <BreadcrumbNav items={breadcrumbItems} />

      <div className="p-4 md:p-6 rounded-xl shadow-lg bg-white">
        <TittleText
          text="Tambah Produk Mobil"
          className=" mb-2 md:mb-4"
          separator={false}
        />
        {submitError && <div className="text-red-500 mb-4">{submitError}</div>}
        <motion.form
          onSubmit={handleSubmit}
          variants={formContainerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <motion.div variants={itemVariants}>
            <label className="block text-sm mb-2 font-medium text-gray-700">
              Gambar Mobil
            </label>
            <ImageUpload
              mediaFiles={mediaFiles}
              setMediaFiles={handleMediaFilesChange}
              error={errors.mediaFiles}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
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
          </motion.div>

          <motion.div variants={itemVariants}>
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
          </motion.div>

          <motion.div variants={itemVariants}>
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
                {
                  value: "suv",
                  label: "SUV",
                  ImgUrl: "/images/CarType/suv.png",
                },
                {
                  value: "mpv",
                  label: "MPV",
                  ImgUrl: "/images/CarType/mpv.png",
                },
                {
                  value: "minibus",
                  label: "Minibus",
                  ImgUrl: "/images/CarType/minibus.png",
                },
              ]}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
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
                { value: "2", label: "2 Kursi" },
                { value: "4", label: "4 Kursi" },
                { value: "5", label: "5 Kursi" },
                { value: "6", label: "6 Kursi" },
                { value: "7", label: "7 Kursi" },
                { value: "8", label: "8 Kursi" },
              ]}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
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
          </motion.div>

          <motion.div variants={itemVariants}>
            <Input
              ref={ccInputRef}
              label="Kapasitas Mesin (CC)"
              id="cc"
              name="cc"
              placeholderTexts={[
                "Kapasitas mesin mobil anda",
                "Kapasitas mesin mobil anda",
                "Kapasitas mesin mobil anda",
              ]}
              value={productData.cc}
              onChange={handleChange}
              formatter={formatNumber}
              error={errors.cc}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Input
              ref={travelDistanceInputRef}
              label="Jarak Tempuh (KM)"
              id="travelDistance"
              name="travelDistance"
              inputMode="numeric"
              placeholderTexts={[
                "Jarak tempuh mobil anda",
                "Jarak tempuh mobil anda",
                "Jarak tempuh mobil anda",
              ]}
              value={productData.travelDistance}
              onChange={handleChange}
              formatter={formatNumber}
              error={errors.travelDistance}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
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
          </motion.div>

          <motion.div variants={itemVariants}>
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
          </motion.div>

          <motion.div variants={itemVariants}>
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
          </motion.div>

          <motion.div variants={itemVariants}>
            <Select
              label="Status"
              id="status"
              name="status"
              value={productData.status}
              onChange={(value) =>
                handleChange({ target: { name: "status", value } })
              }
              options={[
                { value: "Tersedia", label: "Tersedia" },
                { value: "Terjual", label: "Terjual" },
              ]}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              delay: 0.6,
            }}
            className="col-span-2 flex justify-end gap-2 md:gap-4 mt-4"
          >
            <ButtonMagnetic
              type="button"
              onClick={() => router.back("/admin")}
              className="!py-2.5 !m-0"
            >
              Kembali
            </ButtonMagnetic>

            <ButtonAction type="submit" disabled={loading}>
              {loading
                ? uploadProgress.total > 0 &&
                  uploadProgress.current < uploadProgress.total
                  ? `Mengunggah ${uploadProgress.current}/${uploadProgress.total}...`
                  : "Menyimpan..."
                : "Tambah Produk"}
            </ButtonAction>
          </motion.div>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default AddProduct;
