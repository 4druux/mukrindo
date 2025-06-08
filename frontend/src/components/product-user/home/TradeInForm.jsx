// layout/user/product/TradeInForm.jsx
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import toast from "react-hot-toast";
import { unformatNumberPhone } from "@/utils/formatNumberPhone";
import ButtonAction from "@/components/common/ButtonAction";

const TradeInForm = ({
  productData,
  handleFilterChange,
  handleChange,
  brandOptions,
  modelOptions,
  yearOptions,
  phoneNumberError,
  validatePhoneNumber,
  PHONE_PREFIX,
  isLoadingOptions,
}) => {
  const router = useRouter();

  const [brandError, setBrandError] = useState("");
  const [modelError, setModelError] = useState("");
  const [yearError, setYearError] = useState("");
  const [phoneRequiredError, setPhoneRequiredError] = useState("");

  // Refs auto open/focus
  const modelSelectRef = useRef(null);
  const yearSelectRef = useRef(null);
  const phoneNumberInputRef = useRef(null);

  const handleSubmit = () => {
    setBrandError("");
    setModelError("");
    setYearError("");
    setPhoneRequiredError("");

    let isValid = true;
    let currentBrandError = "";
    let currentModelError = "";
    let currentYearError = "";
    let currentPhoneRequiredError = "";

    if (!productData.brand) {
      currentBrandError = "Wajib diisi";
      isValid = false;
    }

    if (!productData.model) {
      currentModelError = "Wajib diisi";
      isValid = false;
    }

    if (!productData.year) {
      currentYearError = "Wajib diisi";
      isValid = false;
    }

    const rawPhoneNumber = unformatNumberPhone(
      productData.phoneNumber,
      PHONE_PREFIX
    );

    const formatError = validatePhoneNumber(productData.phoneNumber);

    if (!rawPhoneNumber) {
      currentPhoneRequiredError = "Wajib diisi";
      isValid = false;
    } else if (formatError) {
      isValid = false;
    }

    setBrandError(currentBrandError);
    setModelError(currentModelError);
    setYearError(currentYearError);
    setPhoneRequiredError(currentPhoneRequiredError);

    if (!isValid || formatError) {
      toast.error("Harap lengkapi semua informasi dengan benar.", {
        className: "custom-toast",
      });
      return;
    }

    const params = new URLSearchParams();
    if (productData.brand) params.set("brand", productData.brand);
    if (productData.model) params.set("model", productData.model);
    if (productData.year) params.set("year", productData.year);
    if (rawPhoneNumber) params.set("phoneNumber", rawPhoneNumber);

    const queryString = params.toString();
    router.push(`/tukar-tambah${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <div className="bg-white rounded-b-2xl lg:rounded-tr-2xl shadow-md p-4 md:p-6 w-full mx-auto">
      <h1 className="text-md font-medium text-gray-700 mb-4">
        Informasi Mobil Kamu
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Select
          label="Merek"
          title="Pilih Merek"
          description="Pilih Merek Mobil Anda"
          searchOption={true}
          options={brandOptions}
          value={productData.brand}
          onChange={(value) => {
            handleFilterChange("brand", value);
            setBrandError("");
            setModelError("");
            setTimeout(() => {
              modelSelectRef.current?.openDropdown();
            }, 50);
          }}
          error={brandError}
          disabled={isLoadingOptions}
        />

        <Select
          ref={modelSelectRef}
          label="Model"
          description={
            productData.brand
              ? "Pilih Model Mobil Anda"
              : "Pilih Merek Mobil Anda Terlebih Dahulu!"
          }
          options={modelOptions}
          value={productData.model}
          onChange={(value) => {
            handleFilterChange("model", value);
            setModelError("");
            setTimeout(() => {
              yearSelectRef.current?.openDropdown();
            }, 50);
          }}
          title="Pilih Model"
          disabled={isLoadingOptions || !productData.brand}
          error={modelError}
        />

        <Select
          ref={yearSelectRef}
          label="Tahun"
          title="Pilih Tahun"
          description="Pilih Tahun Mobil Anda"
          value={productData.year}
          onChange={(value) => {
            handleFilterChange("year", value);
            setYearError("");
            setTimeout(() => {
              phoneNumberInputRef.current?.focus();
            }, 50);
          }}
          options={yearOptions}
          error={yearError}
        />

        <Input
          ref={phoneNumberInputRef}
          label="No Handphone"
          id="phoneNumber"
          name="phoneNumber"
          value={productData.phoneNumber}
          onChange={(e) => {
            handleChange(e);
            setPhoneRequiredError("");
          }}
          prefix={PHONE_PREFIX}
          type="tel"
          error={phoneRequiredError || phoneNumberError}
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
        <p className="text-xs lg:text-sm text-gray-500 md:flex-2 xl:flex-4">
          Dapatkan penawaran terbaik untuk tukar tambah mobil lama Anda dengan
          yang baru di Mukrindo.id
        </p>

        <ButtonAction
          onClick={handleSubmit}
          type="button"
          className="w-full md:flex-1 !px-0 py-3"
        >
          Tukar Sekarang
        </ButtonAction>
      </div>
    </div>
  );
};

export default TradeInForm;
