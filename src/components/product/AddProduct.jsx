// AddProduct.jsx
"use client";
import React, { useState, useEffect } from "react";
import carData from "./carData";

const AddProduct = () => {
  const [productData, setProductData] = useState({
    imageUrl: "",
    carName: "",
    transmission: "",
    fuelType: "",
    carColor: "",
    stnkExpiry: "",
    brand: "",
    model: "",
    variant: "",
    type: "",
    cc: "",
    jarakTempuh: "",
    driveSystem: "",
    plateNumber: "",
    yearOfAssembly: "",
  });

  // State untuk filtered models dan variants
  const [filteredModels, setFilteredModels] = useState([]);
  const [filteredVariants, setFilteredVariants] = useState([]);

  // useEffect untuk mengupdate filtered models ketika brand berubah
  useEffect(() => {
    if (productData.brand) {
      setFilteredModels(Object.keys(carData[productData.brand] || {})); // Object.keys untuk mendapatkan array nama model
      // Reset model dan variant jika brand berubah
      setProductData((prev) => ({ ...prev, model: "", variant: "" }));
    } else {
      setFilteredModels([]); // Kosongkan jika tidak ada brand yang dipilih
    }
    setFilteredVariants([]); // Selalu kosongkan variants saat brand berubah
  }, [productData.brand]);

  // useEffect untuk mengupdate filtered variants ketika model berubah
  useEffect(() => {
    if (productData.brand && productData.model) {
      setFilteredVariants(carData[productData.brand][productData.model] || []);
      setProductData((prev) => ({ ...prev, variant: "" })); // Reset variant
    } else {
      setFilteredVariants([]);
    }
  }, [productData.brand, productData.model]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file.");
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setProductData((prevData) => ({ ...prevData, imageUrl }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productData.carName.trim()) {
      alert("Nama mobil harus diisi.");
      return;
    }
    if (!productData.brand.trim()) {
      alert("Merek mobil harus diisi.");
      return;
    }
    if (
      !productData.yearOfAssembly.trim() ||
      isNaN(parseInt(productData.yearOfAssembly))
    ) {
      alert("Tahun perakitan harus diisi dan berupa angka.");
      return;
    }
    console.log("Data Produk:", productData);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Tambah Produk Mobil</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... (bagian input gambar dan nama mobil tetap sama) */}
        <div>
          <label
            htmlFor="imageUrl"
            className="block text-sm font-medium text-gray-700"
          >
            Gambar Mobil
          </label>
          <input
            type="file"
            id="imageUrl"
            name="imageUrl"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {productData.imageUrl && (
            <img
              src={productData.imageUrl}
              alt="Preview"
              className="mt-2 h-20 w-auto"
            />
          )}
        </div>
        {/* Nama Mobil */}
        <div>
          <label
            htmlFor="carName"
            className="block text-sm font-medium text-gray-700"
          >
            Nama Mobil
          </label>
          <input
            type="text"
            id="carName"
            name="carName"
            value={productData.carName}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Merek Mobil */}
          <div>
            <label
              htmlFor="brand"
              className="block text-sm font-medium text-gray-700"
            >
              Merek Mobil
            </label>
            <select
              id="brand"
              name="brand"
              value={productData.brand}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Pilih Merek</option>
              {Object.keys(carData).map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Model Mobil */}
          <div>
            <label
              htmlFor="model"
              className="block text-sm font-medium text-gray-700"
            >
              Model Mobil
            </label>
            <select
              id="model"
              name="model"
              value={productData.model}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!productData.brand} // Disable jika brand belum dipilih
            >
              <option value="">Pilih Model</option>
              {filteredModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Varian Mobil */}
          <div>
            <label
              htmlFor="variant"
              className="block text-sm font-medium text-gray-700"
            >
              Varian Mobil
            </label>
            <select
              id="variant"
              name="variant"
              value={productData.variant}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!productData.model} // Disable jika model belum dipilih
            >
              <option value="">Pilih Varian</option>
              {filteredVariants.map((variant) => (
                <option key={variant} value={variant}>
                  {variant}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* ... (sisa input lainnya tetap sama) */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700"
          >
            Tipe Mobil
          </label>
          <select
            type="text"
            id="type"
            name="type"
            value={productData.type}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Pilih Tipe Mobil</option>
            <option value="sedan">Sedan</option>
            <option value="hatchback">Hatchback</option>
            <option value="suv">SUV</option>
            <option value="mpv">MPV</option>
            <option value="minibus">Minibus</option>
          </select>
        </div>
        {/* Warna Mobil */}
        <div>
          <label
            htmlFor="carColor"
            className="block text-sm font-medium text-gray-700"
          >
            Warna Mobil
          </label>
          <input
            type="text"
            id="carColor"
            name="carColor"
            value={productData.carColor}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        {/* CC Mobil */}
        <div>
          <label
            htmlFor="cc"
            className="block text-sm font-medium text-gray-700"
          >
            CC Mobil
          </label>
          <input
            type="text"
            id="cc"
            name="cc"
            value={productData.cc}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        {/* Jarak Tempuh */}
        <div>
          <label
            htmlFor="jarakTempuh"
            className="block text-sm font-medium text-gray-700"
          >
            Jarak Tempuh
          </label>
          <input
            type="text"
            id="jarakTempuh"
            name="jarakTempuh"
            value={productData.jarakTempuh}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sistem Penggerak */}
          <div>
            <label
              htmlFor="driveSystem"
              className="block text-sm font-medium text-gray-700"
            >
              Sistem Penggerak
            </label>
            <select
              type="text"
              id="driveSystem"
              name="driveSystem"
              value={productData.driveSystem}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Pilih Sistem Penggerak</option>
              <option value="rwd">RWD</option>
              <option value="fwd">FWD</option>
              <option value="awd">AWD</option>
              <option value="4wd">4WD</option>
            </select>
          </div>
          {/* Transmisi */}
          <div>
            <label
              htmlFor="transmission"
              className="block text-sm font-medium text-gray-700"
            >
              Transmisi
            </label>
            <select
              id="transmission"
              name="transmission"
              value={productData.transmission}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Pilih Transmisi</option>
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
              <option value="cvt">CVT</option>
            </select>
          </div>
          {/* Bahan Bakar */}
          <div>
            <label
              htmlFor="fuelType"
              className="block text-sm font-medium text-gray-700"
            >
              Bahan Bakar
            </label>
            <select
              type="text"
              id="fuelType"
              name="fuelType"
              value={productData.fuelType}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Pilih Bahan Bakar</option>
              <option value="bensin">Bensin</option>
              <option value="solar">Solar </option>
              <option value="hybrid">Hybrid </option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Masa Berlaku STNK */}
          <div>
            <label
              htmlFor="stnkExpiry"
              className="block text-sm font-medium text-gray-700"
            >
              Masa Berlaku STNK
            </label>
            <input
              type="text"
              id="stnkExpiry"
              name="stnkExpiry"
              value={productData.stnkExpiry}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {/* Plat Nomor */}
          <div>
            <label
              htmlFor="plateNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Plat Nomor
            </label>
            <select
              type="text"
              id="plateNumber"
              name="plateNumber"
              value={productData.plateNumber}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Pilih Plat Nomor</option>
              <option value="ganjil">Ganjil</option>
              <option value="genap">Genap</option>
            </select>
          </div>
          {/* Tahun Perakitan */}
          <div>
            <label
              htmlFor="yearOfAssembly"
              className="block text-sm font-medium text-gray-700"
            >
              Tahun Perakitan
            </label>
            <select
              type="text"
              id="yearOfAssembly"
              name="yearOfAssembly"
              value={productData.yearOfAssembly}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Pilih Tahun Perakitan</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>
        {/* Tombol Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-3 px-6  rounded-full focus:outline-none focus:shadow-outline"
          >
            Tambah Produk
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
