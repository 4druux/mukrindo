// components/sell-car/Step2Form.jsx
import React from "react";
import Input from "@/components/common/Input";
import ButtonMagnetic from "../common/ButtonMagnetic";
import ButtonAction from "../common/ButtonAction";

const Step2Form = ({
  formData,
  handleChange,
  errors,
  onNext,
  onBack,
  PHONE_PREFIX,
  currentStep,
  totalCarSteps,
}) => {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-700 mb-1">
        Informasi Kontak Kamu
      </h2>
      <p className="text-sm text-gray-700 mb-6">
        Selesaikan {currentStep} dari {totalCarSteps.length} langkah dan kami
        akan menghubungimu berdasarkan informasi ini.
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
      <div className="flex justify-end gap-x-2 sm:gap-x-4 mt-4">
        <ButtonMagnetic type="button" onClick={onBack} className="!py-2.5 !m-0">
          Kembali
        </ButtonMagnetic>

        <ButtonAction type="button" onClick={onNext}>
          Selanjutnya
        </ButtonAction>
      </div>
    </div>
  );
};

export default Step2Form;
