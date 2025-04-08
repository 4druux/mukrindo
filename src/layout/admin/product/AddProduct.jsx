// AddProduct.jsx
"use client";
import { useState } from "react";
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
        delete newErrors[name]; // Hapus error untuk field ini
        return newErrors;
      });
    }
  };

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
    clearErrorOnChange(name); // Bersihkan error saat user mengetik/memilih
  };

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
    // Bersihkan error untuk brand, model, dan variant saat salah satu berubah
    if (errors.brand || errors.model || errors.variant) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.brand;
        delete newErrors.model;
        delete newErrors.variant;
        return newErrors;
      });
    }
  };

  const handleMediaFilesChange = (newFiles) => {
    setMediaFiles(newFiles);
    clearErrorOnChange("mediaFiles"); // Bersihkan error mediaFiles
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});

    const validationErrors = validateProductData(productData, mediaFiles);
    console.log("Validation Errors:", validationErrors); // <-- Tambahkan ini

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors); // Set error spesifik per field
      toast.error("Harap periksa kembali data yang Anda masukkan.", {
        className: "custom-toast",
      });

      const firstErrorKey = Object.keys(validationErrors)[0];
      const errorElement = document.getElementById(firstErrorKey); // Pastikan komponen punya id={name}
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setLoading(true);

    try {
      // Cek crop sebelum konversi (jika belum divalidasi di validateProductData)
      const uncropped = mediaFiles.find((fileObj) => !fileObj.cropped);
      if (uncropped) {
        throw new Error("Selesaikan proses crop untuk semua gambar.");
      }

      const base64Images = await Promise.all(
        mediaFiles.map((fileObj) => {
          return new Promise((resolve, reject) => {
            // Asumsi fileObj.cropped adalah Blob hasil crop
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

      console.log("Produk berhasil ditambahkan:", response.data);
      mutateProducts();

      // Reset form (termasuk errors) setelah sukses
      setProductData({
        /* ... initial state ... */
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
      setSubmitError(errorMessage);
      setErrors((prev) => ({ ...prev, submit: errorMessage }));
      setLoading(false);
    }
  };

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
            carData={carData}
            brand={productData.brand}
            model={productData.model}
            variant={productData.variant}
            onChange={handleBrandChange}
            errors={errors}
          />
          <Select
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
            data={{
              driveSystem: productData.driveSystem,
              transmission: productData.transmission,
              fuelType: productData.fuelType,
            }}
            onChange={handleChange}
            errors={errors}
          />
          {/* CarPapers */}
          <CarPapers
            data={{
              stnkExpiry: productData.stnkExpiry,
              plateNumber: productData.plateNumber,
              yearOfAssembly: productData.yearOfAssembly,
            }}
            onChange={handleChange}
            errors={errors}
          />
          <Input
            label="Harga Mobil"
            id="price"
            name="price"
            value={productData.price}
            onChange={handleChange}
            formatter={formatNumber}
            error={errors.price}
            prefix="Rp "
          />
          {/* Status Select */}
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
              {loading ? "Menambahkan..." : "Tambah Produk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
