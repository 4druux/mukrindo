// layout/user/product/CarForm.jsx
"use client";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import { formatNumber, unformatNumber } from "@/utils/formatNumber";
import carData from "@/utils/carData";
import  { useState } from "react";

// Import Icon
import { FaCar, FaExchangeAlt, FaMoneyBillWave } from "react-icons/fa";

const CarForm = () => {
  const [activeTab, setActiveTab] = useState("beli");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [productData, setProductData] = useState({
    brand: "",
    model: "",
    phoneNumber: "",
    yearOfAssembly: "",
  });

  const brandOptionsForSelect = Object.keys(carData).map((brand) => ({
    value: brand,
    label: brand,
  }));

  const modelOptionsForSelect =
    selectedBrand && carData[selectedBrand]
      ? Object.keys(carData[selectedBrand]).map((model) => ({
          value: model,
          label: model,
        }))
      : [];

  const priceOptionsData = [
    "< Rp150.000.000",
    "Ro150.000.000 - Rp300.000.000",
    ">Rp300.000.000",
  ];

  const priceOptionsForSelect = priceOptionsData.map((price) => ({
    value: price,
    label: price,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;
    if (name === "phoneNumber") {
      updatedValue = unformatNumber(value);
    }
    setProductData((prevData) => ({
      ...prevData,
      [name]: updatedValue,
    }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i).map(
    (year) => ({
      value: year.toString(),
      label: year.toString(),
    })
  );

  const renderForm = () => {
    switch (activeTab) {
      case "beli":
        return (
          <div className="bg-white rounded-b-2xl lg:rounded-tr-2xl shadow-lg p-4 md:p-6 w-full mx-auto">
            <h1 className="text-md font-medium text-gray-700 mb-4">
              Cari Mobil yang Anda Inginkan
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Select Merek */}
              <Select
                label="Merek"
                title="Pilih Merek"
                description="Pilih Merek Mobil Anda"
                options={brandOptionsForSelect}
                value={selectedBrand}
                onChange={(value) => {
                  setSelectedBrand(value);
                  setSelectedModel("");
                }}
              />

              {/* Select Model */}
              <Select
                label="Model"
                title="Pilih Model"
                description="Pilih Model Mobil Anda"
                options={modelOptionsForSelect}
                value={selectedModel}
                onChange={setSelectedModel}
              />

              {/* Select Harga */}
              <Select
                label="Harga"
                options={priceOptionsForSelect}
                value={selectedPrice}
                onChange={setSelectedPrice}
                title="Pilih Harga"
              />

              {/* Select Tahun */}
              <Select
                label="Tahun"
                title="Pilih Tahun"
                description="Pilih Tahun Mobil Anda"
                value={selectedYear}
                onChange={setSelectedYear}
                options={years}
              />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
              <p className="text-xs lg:text-sm text-gray-500">
                Dapatkan mobil terbaik untuk kebutuhanmu dengan harga terbaik di
                Mukrindo.id
              </p>
              <button
                className="w-full md:w-auto py-3 px-16 rounded-full text-sm text-white font-medium transition-colors duration-200
                  bg-orange-500 hover:bg-orange-600"
                type="button"
              >
                Temukan Mobil
              </button>
            </div>
          </div>
        );

      case "jual":
      case "tukar":
        return (
          <div className="bg-white rounded-b-2xl lg:rounded-tr-2xl shadow-lg p-4 md:p-6 w-full mx-auto">
            <h1 className="text-md font-medium text-gray-700 mb-4">
              Informasi Mobil Kamu
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Select Merek */}
              <div>
                <Select
                  label="Merek"
                  options={brandOptionsForSelect}
                  value={selectedBrand}
                  onChange={(value) => {
                    setSelectedBrand(value);
                    setSelectedModel("");
                  }}
                  title="Pilih Merek"
                />
              </div>

              {/* Select Model */}
              <div>
                <Select
                  label="Model"
                  options={modelOptionsForSelect}
                  value={selectedModel}
                  onChange={setSelectedModel}
                  title="Pilih Model"
                />
              </div>

              {/* Tahun jual/tukar tambah */}
              <Select
                label="Tahun"
                title="Pilih Tahun"
                description="Pilih Tahun Mobil Anda"
                value={selectedYear}
                onChange={setSelectedYear}
                options={years}
              />

              <Input
                label="No Handphone"
                id="phoneNumber"
                name="phoneNumber"
                value={productData.phoneNumber}
                onChange={handleChange}
                formatter={formatNumber}
                prefix="+62 "
              />
            </div>

            {/* Deskripsi dan Tombol Aksi */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
              <p className="text-xs lg:text-sm text-gray-500">
                Dapatkan estimasi harga dari mobil kamu dengan proses yang cepat
                dan mudah di Mukrindo.id
              </p>
              <button
                className="w-full md:w-auto py-3 px-16 rounded-full text-sm text-white font-medium transition-colors duration-200
                  bg-orange-500 hover:bg-orange-600"
                type="button"
              >
                {activeTab === "jual" ? "Jual Sekarang" : "Lanjut Tukar"}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex w-full bg-gray-200 lg:w-fit rounded-t-3xl shadow-lg">
        {/* Tab Beli Mobil */}
        <button
          onClick={() => setActiveTab("beli")}
          className={`relative w-full lg:w-fit rounded-tl-3xl rounded-br-2xl cursor-pointer ${
            activeTab === "beli"
              ? "bg-white text-orange-500 before:absolute before:-right-5 before:top-0 before:h-6 before:w-10 before:bg-gray-200 before:content-[''] after:absolute after:top-0 after:right-0 after:h-6 after:w-5 after:rounded-tr-3xl after:bg-white after:content-['']"
              : activeTab === "jual"
              ? "bg-gray-200 text-gray-500 hover:text-gray-700 before:absolute before:-right-3 before:bottom-0 before:h-6 before:w-6 before:bg-white before:content-[''] after:absolute after:bottom-0 after:right-0 after:h-6 after:w-4 after:rounded-br-3xl after:bg-gray-200 after:content-['']"
              : "bg-gray-300 text-gray-500 hover:text-gray-700 before:absolute before:-right-3 before:top-0 before:h-6 before:w-6 before:bg-gray-300 before:content-[''] after:absolute after:top-0 after:right-0 after:h-6 after:w-4 after:rounded-tr-3xl after:bg-gray-300 after:content-['']"
          }`}
        >
          <div className="m-0 flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold lg:px-8">
            <div className="w-fit items-center justify-center lg:w-full">
              <div className="flex items-center justify-center gap-2 py-4">
                <FaCar className="w-4 h-4 hidden lg:block" />
                <h3 className="text-xs lg:text-sm font-medium">Beli Mobil</h3>
              </div>
            </div>
          </div>
        </button>

        {/* Tab Jual Mobil */}
        <button
          onClick={() => setActiveTab("jual")}
          className={`relative w-full lg:w-fit rounded-tl-2xl cursor-pointer ${
            activeTab === "jual"
              ? "bg-white text-orange-500 before:absolute before:-right-5 before:top-0 before:h-6 before:w-10 before:bg-gray-200 before:content-[''] after:absolute after:top-0 after:right-0 after:h-6 after:w-6 after:rounded-tr-2xl after:bg-white after:content-['']"
              : activeTab === "tukar"
              ? "bg-gray-200 text-gray-500 hover:text-gray-700 before:absolute before:-right-3 before:bottom-0 before:h-6 before:w-6 before:bg-white before:content-[''] after:absolute after:bottom-0 after:right-0 after:h-6 after:w-4 after:rounded-br-3xl after:bg-gray-200 after:content-['']"
              : "bg-gray-200 text-gray-500 hover:text-gray-700 before:absolute before:-left-4 before:bottom-0 before:h-6 before:w-6 before:bg-white before:content-[''] after:absolute after:bottom-0 after:left-0 after:h-6 after:w-4 after:rounded-bl-3xl after:bg-gray-200 after:content-['']"
          }`}
        >
          <div className="m-0 flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold lg:px-8">
            <div className="w-fit items-center justify-center lg:w-full">
              <div className="flex items-center justify-center gap-2 py-4">
                <FaMoneyBillWave className="w-4 h-4 hidden lg:block" />
                <h3 className="text-xs lg:text-sm font-medium">Jual Mobil</h3>
              </div>
            </div>
          </div>
        </button>

        {/* Tab Tukar Tambah */}
        <button
          onClick={() => setActiveTab("tukar")}
          className={`relative w-full lg:w-fit rounded-tr-3xl rounded-bl-2xl cursor-pointer ${
            activeTab === "tukar"
              ? "bg-white text-orange-500 before:absolute before:-left-5 before:top-0 before:h-6 before:w-10 before:bg-gray-200 before:content-[''] after:absolute after:left-0 after:top-0 after:h-6 after:w-5 after:rounded-tl-3xl after:bg-white after:content-['']"
              : activeTab === "jual"
              ? "bg-gray-200 text-gray-500 hover:text-gray-700 before:absolute before:-left-3 before:bottom-0 before:h-6 before:w-6 before:bg-white before:content-[''] after:absolute after:bottom-0 after:left-0 after:h-6 after:w-4 after:rounded-bl-3xl after:bg-gray-200 after:content-['']"
              : "bg-gray-300 text-gray-500 hover:text-gray-700 before:absolute before:-left-3 before:top-0 before:h-6 before:w-8 before:bg-gray-300 before:content-[''] after:absolute after:top-0 after:-left-4 after:h-6 after:w-4 after:rounded-tr-3xl after:bg-gray-200 after:content-['']"
          }`}
        >
          <div className="m-0 flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold lg:px-8">
            <div className="w-fit items-center justify-center lg:w-full">
              <div className="flex items-center justify-center gap-2 py-4">
                <FaExchangeAlt className="w-4 h-4 hidden lg:block" />
                <h3 className="text-xs lg:text-sm font-medium">Tukar Mobil</h3>
              </div>
            </div>
          </div>
        </button>
      </div>
      {renderForm()}
    </div>
  );
};

export default CarForm;
