// components/sell-car/Step2Form.jsx
import React from "react";
import Input from "@/components/common/Input";

const Step2Form = ({
  formData,
  handleChange,
  errors,
  onSubmit,
  onBack,
  PHONE_PREFIX, // Terima dari SellCar
}) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">
        Informasi Kontak Kamu
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Kami akan menghubungimu berdasarkan informasi ini.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Input
          label="Nama Lengkap"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nama Lengkap Sesuai STNK"
          error={errors.name}
        />
        <Input
          label="No Handphone"
          name="phoneNumber"
          type="tel"
          prefix={PHONE_PREFIX}
          value={formData.phoneNumber}
          onChange={handleChange}
          error={errors.phoneNumber || errors.phoneFormat}
        />
        <Input
          label="Alamat Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="contoh@email.com"
          error={errors.email}
        />
      </div>
      <div className="flex justify-end space-x-2 sm:space-x-4 mt-4">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer border text-orange-600 border-orange-500 hover:bg-orange-100 hover:border-orange-500 
                hover:text-orange-600 text-sm font-medium py-2.5 px-6 rounded-full focus:outline-none focus:shadow-outline"
        >
          Kembali
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="cursor-pointer bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium py-2.5 px-6 rounded-full focus:outline-none focus:shadow-outline"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
};

export default Step2Form;
