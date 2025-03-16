"use client";
import React, { useState } from "react";
import { FaCar, FaExchangeAlt, FaMoneyBillWave } from "react-icons/fa";

const CarForm = () => {
  const [activeTab, setActiveTab] = useState("beli");

  // Helper function for the dropdown arrow (reusable)
  const DropdownArrow = () => (
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
      <svg
        className="fill-current h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
      </svg>
    </div>
  );

  // Data for dropdown options (better for maintainability)
  const brandOptions = ["Toyota", "Honda", "Ford", "BMW", "Mercedes-Benz"]; // Example brands
  const priceOptions = ["< $10,000", "$10,000 - $20,000", "> $20,000"]; // Example price ranges
  const yearOptions = Array.from(
    { length: 20 },
    (_, i) => new Date().getFullYear() - i
  ); // Generate last 20 years
  const locationOptions = ["Jakarta", "Surabaya", "Medan", "Bandung"]; // Example locations

  const renderForm = () => {
    switch (activeTab) {
      case "beli":
        return (
          <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-lg p-4 md:p-6 w-full mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="relative md:col-span-1">
                <select
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-red-500"
                  aria-label="Select Brand and Model" // Added for accessibility
                >
                  <option value="">Pilih Merek dan Model</option>{" "}
                  {/* Empty option for placeholder */}
                  {brandOptions.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
                <DropdownArrow />
              </div>
              <div className="relative md:col-span-1">
                <select
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-red-500"
                  aria-label="Select Price Range"
                >
                  <option value="">Pilih Harga</option>
                  {priceOptions.map((price) => (
                    <option key={price} value={price}>
                      {price}
                    </option>
                  ))}
                </select>
                <DropdownArrow />
              </div>
              <div className="relative md:col-span-1">
                <select
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-red-500"
                  aria-label="Select Year"
                >
                  <option value="">Pilih Tahun</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <DropdownArrow />
              </div>
              <div className="relative md:col-span-1">
                <select
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-red-500"
                  aria-label="Select Location"
                >
                  <option value="">Pilih Lokasi</option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <DropdownArrow />
              </div>
              <button
                className="md:col-span-1 w-full py-3 px-4 rounded-full text-white font-medium transition-colors duration-200 bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50" // Added focus styles
                type="button" // Good practice to specify button type
              >
                Temukan Mobil
              </button>
            </div>
          </div>
        );
      case "jual":
      case "tukar":
        return (
          <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-lg p-4 md:p-6 w-full mx-auto">
            <div className="flex flex-col gap-4">
              <div className="text-md font-bold text-gray-600">
                Informasi Mobil Kamu
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                <div className="relative">
                  <select
                    className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-red-500"
                    aria-label="Select Brand and Model"
                  >
                    <option value="">Pilih Merek & Model</option>
                    {brandOptions.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                  <DropdownArrow />
                </div>
                <div className="relative">
                  {/* Improved Year Input - Number Input */}
                  <input
                    type="number"
                    placeholder="Pilih Tahun"
                    className="block w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded leading-tight focus:outline-none focus:border-red-500"
                    min="1900" // Set reasonable min and max years
                    max={new Date().getFullYear()}
                    step="1" // Increment by 1 year
                  />
                  {/* You could add a calendar icon here if you integrate a date picker library */}
                </div>
                <input
                  type="tel"
                  placeholder="No Handphone"
                  className="block w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded leading-tight focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="mt-2 text-sm text-gray-500 ml-0.5">
                  Dapatkan estimasi harga dari mobil kamu dengan proses yang
                  cepat dan mudah di Mukrindo.id
                </p>
                <button
                  className="py-3 px-16 rounded-full text-white font-medium transition-colors duration-200 bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  type="button"
                >
                  Temukan Mobil
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="my-8">
      {/* Container Utama */}
      <div
        id="filter-container"
        className="flex w-full bg-gray-200 lg:w-fit rounded-t-3xl"
      >
        {/* Tab Beli Mobil */}
        <button // Changed to button for better semantics and accessibility
          onClick={() => setActiveTab("beli")}
          className={`relative w-full lg:w-fit rounded-tl-2xl rounded-br-2xl ${
            activeTab === "beli"
              ? "bg-white text-red-500 before:absolute before:-right-5 before:top-0 before:h-6 before:w-10 before:bg-gray-200 before:content-[''] after:absolute after:top-0 after:right-0 after:h-6 after:w-5 after:rounded-tr-3xl after:bg-white after:content-['']"
              : activeTab === "jual"
              ? "bg-gray-200 text-gray-500 hover:text-gray-700 before:absolute before:-right-3 before:bottom-0 before:h-6 before:w-6 before:bg-white before:content-[''] after:absolute after:bottom-0 after:right-0 after:h-6 after:w-4 after:rounded-br-3xl after:bg-gray-200 after:content-['']"
              : "bg-gray-300 text-gray-500 hover:text-gray-700 before:absolute before:-right-3 before:top-0 before:h-6 before:w-6 before:bg-gray-300 before:content-[''] after:absolute after:top-0 after:right-0 after:h-6 after:w-4 after:rounded-tr-3xl after:bg-gray-300 after:content-['']"
          }`}
        >
          <div className="m-0 flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold lg:px-8">
            <div className="w-fit items-center justify-center lg:w-full">
              <div className="flex flex-row items-center justify-center gap-2 py-4">
                <FaCar className="mr-2" />
                <h3 className="z-10 text-sm font-medium">Beli Mobil</h3>
              </div>
            </div>
          </div>
        </button>
        {/* Tab Jual Mobil */}
        <button // Changed to button
          onClick={() => setActiveTab("jual")}
          className={`relative w-full lg:w-fit rounded-tl-2xl ${
            activeTab === "jual"
              ? "bg-white text-red-500 before:absolute before:-right-5 before:top-0 before:h-6 before:w-10 before:bg-gray-200 before:content-[''] after:absolute after:top-0 after:right-0 after:h-6 after:w-6 after:rounded-tr-3xl after:bg-white after:content-['']"
              : activeTab === "tukar"
              ? "bg-gray-200 text-gray-500 hover:text-gray-700 before:absolute before:-right-3 before:bottom-0 before:h-6 before:w-6 before:bg-white before:content-[''] after:absolute after:bottom-0 after:right-0 after:h-6 after:w-4 after:rounded-br-3xl after:bg-gray-200 after:content-['']"
              : "bg-gray-200 text-gray-500 hover:text-gray-700 before:absolute before:-left-4 before:bottom-0 before:h-6 before:w-6 before:bg-white before:content-[''] after:absolute after:bottom-0 after:left-0 after:h-6 after:w-4 after:rounded-bl-3xl after:bg-gray-200 after:content-['']"
          }`}
        >
          <div className="m-0 flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold lg:px-8">
            <div className="w-fit items-center justify-center lg:w-full">
              <div className="flex flex-row items-center justify-center gap-2 py-4">
                <FaMoneyBillWave className="mr-2" />
                <h3 className="z-10 text-sm font-medium">Jual Mobil</h3>
              </div>
            </div>
          </div>
        </button>
        {/* Tab Tukar Tambah */}
        <button // Changed to button
          onClick={() => setActiveTab("tukar")}
          className={`relative w-full lg:w-fit rounded-tr-2xl rounded-bl-2xl ${
            activeTab === "tukar"
              ? "bg-white text-red-500 before:absolute before:-left-5 before:top-0 before:h-6 before:w-10 before:bg-gray-200 before:content-[''] after:absolute after:left-0 after:top-0 after:h-6 after:w-5 after:rounded-tl-3xl after:bg-white after:content-['']"
              : activeTab === "jual"
              ? "bg-gray-200 text-gray-500 hover:text-gray-700 before:absolute before:-left-3 before:bottom-0 before:h-6 before:w-6 before:bg-white before:content-[''] after:absolute after:bottom-0 after:left-0 after:h-6 after:w-4 after:rounded-bl-3xl after:bg-gray-200 after:content-['']"
              : "bg-gray-300 text-gray-500 hover:text-gray-700 before:absolute before:-left-2 before:top-0 before:h-6 before:w-8 before:bg-gray-300 before:content-[''] after:absolute after:top-0 after:-left-4 after:h-6 after:w-4 after:rounded-tr-3xl after:bg-gray-200 after:content-['']"
          }`}
        >
          <div className="m-0 flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold lg:px-8">
            <div className="w-fit items-center justify-center lg:w-full">
              <div className="flex flex-row items-center justify-center gap-2 py-4">
                <FaExchangeAlt className="mr-2" />
                <h3 className="z-10 text-sm font-medium">Tukar Tambah</h3>
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
