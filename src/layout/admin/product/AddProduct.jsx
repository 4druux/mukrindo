// AddProduct.jsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { useProducts } from "@/context/ProductContext";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import ImageUpload from "@/components/product-admin/ImageUpload";
import CarBrands from "@/components/product-admin/CarBrands";
import CarSystems from "@/components/product-admin/CarSystems";
import CarPapers from "@/components/product-admin/CarPapers";
import { validateProductData } from "@/utils/validateProductData";
import { formatNumber, unformatNumber } from "@/utils/formatNumber";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import carData from "@/utils/carData";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

const AddProduct = () => {
  const [productData, setProductData] = useState({
    carName: "",
    brand: "",
    model: "",
    variant: "",
    type: "",
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
  const carColorInputRef = useRef(null);
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
  const [submitError, setSubmitError] = useState(null);
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const { mutateProducts } = useProducts();
  const API_ENDPOINT = "http://localhost:5000/api/products";

  const clearErrorOnChange = (name) => {
    if (errors[name]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const inputTimers = useRef({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;
    if (name === "price" || name === "cc" || name === "travelDistance") {
      updatedValue = unformatNumber(value);
    }
    setProductData((prevData) => ({
      ...prevData,
      [name]: updatedValue,
    }));
    clearErrorOnChange(name);

    if (inputTimers.current[name]) {
      clearTimeout(inputTimers.current[name]);
    }

    if (!value) {
      return;
    }

    const inactivityDelay = 750;

    // logic auto focus/open
    if (name === "carName") {
      inputTimers.current[name] = setTimeout(() => {
        brandSelectRef.current?.openDropdown();
      }, inactivityDelay);
    } else if (name === "type" && value) {
      setTimeout(() => carColorInputRef.current?.focus(), 50);
    } else if (name === "carColor") {
      inputTimers.current[name] = setTimeout(() => {
        ccInputRef.current?.focus();
      }, inactivityDelay);
    } else if (name === "cc") {
      inputTimers.current[name] = setTimeout(() => {
        travelDistanceInputRef.current?.focus();
      }, inactivityDelay);
    } else if (name === "travelDistance") {
      inputTimers.current[name] = setTimeout(() => {
        driveSystemSelectRef.current?.openDropdown();
      }, inactivityDelay);
    } else if (name === "driveSystem" && value) {
      setTimeout(() => transmissionSelectRef.current?.openDropdown(), 50);
    } else if (name === "transmission" && value) {
      setTimeout(() => fuelTypeSelectRef.current?.openDropdown(), 50);
    } else if (name === "fuelType" && value) {
      setTimeout(() => stnkExpiryInputRef.current?.focus(), 50);
    } else if (name === "stnkExpiry") {
      inputTimers.current[name] = setTimeout(() => {
        plateNumberSelectRef.current?.openDropdown();
      }, inactivityDelay);
    } else if (name === "plateNumber" && value) {
      setTimeout(() => yearOfAssemblySelectRef.current?.openDropdown(), 50);
    } else if (name === "yearOfAssembly" && value) {
      setTimeout(() => priceInputRef.current?.focus(), 50);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(inputTimers.current).forEach(clearTimeout);
    };
  }, []);

  const handleBrandChange = (field, value, modelValue, variantValue) => {
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

    // logic auto focus/open
    if (field === "brand" && value) {
      setTimeout(() => modelSelectRef.current?.openDropdown(), 50);
    } else if (field === "model" && value) {
      setTimeout(() => variantSelectRef.current?.openDropdown(), 50);
    } else if (field === "variant" && value) {
      setTimeout(() => typeSelectRef.current?.openDropdown(), 50);
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

    try {
      const base64Images = await Promise.all(
        mediaFiles.map((fileObj) => {
          return new Promise((resolve, reject) => {
            if (!fileObj.cropped) {
              reject(new Error("Gambar belum di-crop."));
              return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(fileObj.cropped);
          });
        })
      );

      const submitData = {
        ...productData,
        images: base64Images,
      };

      const response = await axios.post(API_ENDPOINT, submitData);
      toast.success("Produk berhasil ditambahkan.", {
        className: "custom-toast",
      });
      console.log("Product ditambahkan:", response.data);

      mutateProducts();

      setProductData({
        carName: "",
        brand: "",
        model: "",
        variant: "",
        type: "",
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

      router.push("/admin");
    } catch (error) {
      console.error("Error adding product:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal menambahkan produk. Silakan coba lagi.";
      setErrors(errorMessage);
      setSubmitError(errorMessage);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh] bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Beranda", href: "/admin" },
    { label: "Tambah Produk", href: "" },
  ];

  return (
    <div>
      <BreadcrumbNav items={breadcrumbItems} />

      <div className="p-6 rounded-xl shadow-lg bg-white">
        <h2 className="text-2xl font-medium mb-4">Tambah Produk Mobil</h2>
        {submitError && <div className="text-red-500 mb-4">{submitError}</div>}
        {loading && <div className="text-orange-500 mb-4">Menambahkan...</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Input
            ref={carColorInputRef}
            label="Warna Mobil"
            id="carColor"
            name="carColor"
            placeholderTexts={[
              "Warna mobil anda",
              "Warna mobil anda",
              "Warna mobil anda",
            ]}
            value={productData.carColor}
            onChange={handleChange}
            error={errors.carColor}
          />

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

          <Input
            ref={travelDistanceInputRef}
            label="Jarak Tempuh (KM)"
            id="travelDistance"
            name="travelDistance"
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
            onChange={(value) =>
              handleChange({ target: { name: "status", value } })
            }
            options={[
              { value: "Tersedia", label: "Tersedia" },
              { value: "Terjual", label: "Terjual" },
            ]}
          />

          {/* Submit Button */}
          <div className="col-span-2 flex justify-end space-x-2 sm:space-x-4 mt-4">
            <button
              type="button"
              onClick={() => router.back("/admin")}
              className="cursor-pointer border text-gray-600 border-gray-500 hover:bg-orange-100 hover:border-orange-500 
            hover:text-orange-600 text-sm font-medium py-2.5 px-6 rounded-full focus:outline-none focus:shadow-outline"
            >
              Kembali
            </button>
            <button
              type="submit"
              className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2.5 px-6 rounded-full focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              Tambah Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
