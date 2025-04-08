// layout/user/product/SellForm.jsx
import React, { useState } from "react"; // Import useState
import { useRouter } from "next/navigation";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import toast from "react-hot-toast";
import { unformatNumberPhone } from "@/utils/formatNumberPhone";

const SellForm = ({
  productData,
  handleFilterChange,
  handleChange,
  brandOptions,
  modelOptions,
  yearOptions,
  phoneNumberError, // Error format dari CarForm
  validatePhoneNumber,
  PHONE_PREFIX,
}) => {
  const router = useRouter();

  // --- State Lokal untuk Error Wajib Diisi ---
  const [brandError, setBrandError] = useState("");
  const [modelError, setModelError] = useState("");
  const [yearError, setYearError] = useState("");
  const [phoneRequiredError, setPhoneRequiredError] = useState("");
  // -----------------------------------------

  const handleSubmit = () => {
    // --- Reset error wajib diisi sebelum validasi ---
    setBrandError("");
    setModelError("");
    setYearError("");
    setPhoneRequiredError("");
    // ---------------------------------------------

    let isValid = true;
    let currentBrandError = "";
    let currentModelError = "";
    let currentYearError = "";
    let currentPhoneRequiredError = "";

    // --- Validasi Wajib Diisi ---
    if (!productData.brand) {
      currentBrandError = "Wajib diisi";
      isValid = false;
    }

    // --- KEMBALIKAN VALIDASI MODEL MENJADI INDEPENDEN ---
    if (!productData.model) {
      currentModelError = "Wajib diisi";
      isValid = false;
    }
    // --- AKHIR PERUBAHAN ---

    if (!productData.year) {
      currentYearError = "Wajib diisi";
      isValid = false;
    }

    // Validasi No Handphone (Wajib diisi & Format)
    const rawPhoneNumber = unformatNumberPhone(
      productData.phoneNumber,
      PHONE_PREFIX
    );
    const formatError = validatePhoneNumber(productData.phoneNumber); // Cek format dari CarForm

    if (!rawPhoneNumber) {
      currentPhoneRequiredError = "Wajib diisi";
      isValid = false;
    } else if (formatError) {
      isValid = false;
    }
    // ---------------------------------

    // --- Update State Error Lokal ---
    setBrandError(currentBrandError);
    setModelError(currentModelError); // Sekarang akan diisi jika model kosong
    setYearError(currentYearError);
    setPhoneRequiredError(currentPhoneRequiredError);
    // -------------------------------

    // Cek jika ada error (wajib diisi ATAU format telepon)
    if (!isValid || formatError) {
      toast.error("Harap lengkapi semua informasi dengan benar.", {
        className: "custom-toast",
      });
      return; // Hentikan proses submit
    }

    // --- Jika Lolos Validasi ---
    // ... (sisa kode navigasi tetap sama)
    const params = new URLSearchParams();
    if (productData.brand) params.set("brand", productData.brand);
    if (productData.model) params.set("model", productData.model);
    if (productData.year) params.set("year", productData.year);
    if (rawPhoneNumber) params.set("phoneNumber", rawPhoneNumber);

    const queryString = params.toString();
    // Sesuaikan URL tujuan berdasarkan file
    if (router.pathname === "/tukar-tambah") {
      // Asumsi Anda bisa akses router atau bedakan dengan cara lain
      router.push(`/tukar-tambah${queryString ? `?${queryString}` : ""}`);
    } else {
      router.push(`/jual-mobil${queryString ? `?${queryString}` : ""}`);
    }
  };

  return (
    <div className="bg-white lg:rounded-b-3xl lg:rounded-tr-3xl shadow-md p-4 md:p-6 w-full mx-auto">
      <h1 className="text-md font-medium text-gray-700 mb-4">
        Informasi Mobil Kamu
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Select Merek */}
        <Select
          label="Merek"
          title="Pilih Merek"
          description="Pilih Merek Mobil Anda"
          searchOption={true}
          options={brandOptions}
          value={productData.brand}
          onChange={(value) => {
            handleFilterChange("brand", value);
            setBrandError(""); // Reset error saat user memilih
            setModelError(""); // Reset error model juga karena tergantung merek
          }}
          error={brandError} // Gunakan state error lokal
        />
        {/* Select Model */}
        <Select
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
            setModelError(""); // Reset error saat user memilih
          }}
          title="Pilih Model"
          disabled={!productData.brand}
          error={modelError} // Gunakan state error lokal
        />
        {/* Select Tahun */}
        <Select
          label="Tahun"
          title="Pilih Tahun"
          description="Pilih Tahun Mobil Anda"
          value={productData.year}
          onChange={(value) => {
            handleFilterChange("year", value);
            setYearError(""); // Reset error saat user memilih
          }}
          options={yearOptions}
          error={yearError} // Gunakan state error lokal
        />
        {/* Input No Handphone */}
        <Input
          label="No Handphone"
          id="phoneNumber"
          name="phoneNumber"
          value={productData.phoneNumber}
          onChange={(e) => {
            handleChange(e);
            setPhoneRequiredError(""); // Reset error wajib diisi saat user mengetik
            // Error format (phoneNumberError) akan diupdate oleh useEffect di CarForm
          }}
          prefix={PHONE_PREFIX}
          type="tel"
          // Prioritaskan error wajib diisi, jika tidak ada, tampilkan error format
          error={phoneRequiredError || phoneNumberError}
        />
      </div>

      {/* Deskripsi dan Tombol Aksi */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
        <p className="text-xs lg:text-sm text-gray-500 flex-4">
          Dapatkan estimasi harga dari mobil kamu dengan proses yang cepat dan
          mudah di Mukrindo.id
        </p>
        <button
          className="w-full lg:flex-1 rounded-full py-3 text-sm text-white font-medium transition-colors duration-200
          bg-orange-600 hover:bg-orange-500 cursor-pointer"
          type="button"
          onClick={handleSubmit} // Panggil fungsi submit yang sudah divalidasi
        >
          Jual Sekarang
        </button>
      </div>
    </div>
  );
};

export default SellForm;
