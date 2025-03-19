// EditProduct.jsx
"use client";
import { useState } from "react";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import ImageUpload from "@/components/product/ImageUpload";
import CarBrands from "@/components/product/CarBrands";
import CarSystems from "@/components/product/CarSystems";
import CarPapers from "@/components/product/CarPapers";
import { validateProductData } from "@/utils/validateProductData";
import { formatNumber, unformatNumber } from "@/utils/formatNumber";
import carData from "@/utils/carData";

const EditProduct = () => {
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
  });
  const [mediaFiles, setMediaFiles] = useState([]);

  // --- Input Change Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if ((name === "price", name === "cc", name === "travelDistance")) {
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

  // --- Form Submission ---
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationError = validateProductData(productData, mediaFiles);
    if (validationError) {
      alert(validationError);
      return;
    }

    const submitData = {
      ...productData,
      imageFile: mediaFiles[0]?.cropped,
    };
    console.log("Data Produk:", submitData);
  };

  return (
    <div className="p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-medium mb-4">Edit Produk Mobil</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload */}
        <div>
          <label className="block text-sm mb-2 font-medium text-gray-700">
            Gambar Mobil
          </label>
          <ImageUpload mediaFiles={mediaFiles} setMediaFiles={setMediaFiles} />
        </div>

        {/* Car Name */}
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

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-3 px-6 rounded-full focus:outline-none focus:shadow-outline"
          >
            Update Produk
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
