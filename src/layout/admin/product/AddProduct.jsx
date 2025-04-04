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
  const [error, setError] = useState(null);
  const router = useRouter();
  const { mutateProducts } = useProducts();
  const API_ENDPOINT = "http://localhost:5000/api/products";

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const validationError = validateProductData(productData, mediaFiles);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (mediaFiles.length === 0) {
      setError("Minimal harus ada satu gambar.");
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

      console.log("Produk berhasil ditambahkan:", response.data);
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

      router.push("/admin");
    } catch (error) {
      console.error("Error adding product:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal menambahkan produk. Silakan coba lagi.";
      setError(errorMessage);
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
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading && <div className="text-orange-500 mb-4">Menambahkan...</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">
              Gambar Mobil
            </label>
            <ImageUpload
              mediaFiles={mediaFiles}
              setMediaFiles={setMediaFiles}
            />
          </div>
          <Input
            label="Nama Mobil"
            id="carName"
            name="carName"
            placeholderTexts={[
              "Nama mobil anda",
              "Nama mobil anda",
              "Nama mobil anda",
            ]}
            value={productData.carName}
            onChange={handleChange}
          />
          <CarBrands
            carData={carData}
            brand={productData.brand}
            model={productData.model}
            variant={productData.variant}
            onChange={handleBrandChange}
          />
          <Select
            label="Tipe Mobil"
            id="type"
            name="type"
            value={productData.type}
            title="Tipe Mobil"
            description="Jenis Tipe Mobil"
            onChange={(value) =>
              handleChange({ target: { name: "type", value } })
            }
            options={[
              { value: "sedan", label: "Sedan" },
              { value: "hatchback", label: "Hatchback" },
              { value: "suv", label: "SUV" },
              { value: "mpv", label: "MPV" },
              { value: "minibus", label: "Minibus" },
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
          />
          <CarSystems
            data={{
              driveSystem: productData.driveSystem,
              transmission: productData.transmission,
              fuelType: productData.fuelType,
            }}
            onChange={handleChange}
          />
          {/* CarPapers */}
          <CarPapers
            data={{
              stnkExpiry: productData.stnkExpiry,
              plateNumber: productData.plateNumber,
              yearOfAssembly: productData.yearOfAssembly,
            }}
            onChange={handleChange}
          />
          <Input
            label="Harga Mobil"
            id="price"
            name="price"
            value={productData.price}
            onChange={handleChange}
            formatter={formatNumber}
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
