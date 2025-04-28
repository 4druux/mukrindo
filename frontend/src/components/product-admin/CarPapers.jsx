// components/product/CarPapers.jsx
"use client";
import React from "react";
import Select from "../common/Select";
import Input from "../common/Input";

const CarPapers = ({
  data,
  onChange,
  errors,
  stnkExpiryRef,
  plateNumberRef,
  yearOfAssemblyRef,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 26 }, (_, i) => currentYear - i).map(
    (year) => ({
      value: year.toString(),
      label: year.toString(),
    })
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Masa Berlaku STNK */}
      <Input
        ref={stnkExpiryRef}
        label="Masa Berlaku STNK"
        id="stnkExpiry"
        name="stnkExpiry"
        type="date"
        value={data.stnkExpiry}
        error={errors.stnkExpiry}
        onChange={(e) => onChange(e)}
      />
      {/* Plat Nomor */}
      <Select
        ref={plateNumberRef}
        label="Plat Nomor"
        id="plateNumber"
        name="plateNumber"
        value={data.plateNumber}
        error={errors.plateNumber}
        title="Plat Nomor"
        description="Jenis Plat Nomor"
        onChange={(value) =>
          onChange({ target: { name: "plateNumber", value } })
        }
        options={[
          { value: "ganjil", label: "Ganjil" },
          { value: "genap", label: "Genap" },
        ]}
      />
      {/* Tahun Perakitan */}
      <Select
        ref={yearOfAssemblyRef}
        label="Tahun Perakitan"
        id="yearOfAssembly"
        name="yearOfAssembly"
        value={data.yearOfAssembly}
        error={errors.yearOfAssembly}
        title="Tahun Perakitan"
        description="Tahun Perakitan Mobil Anda"
        onChange={(value) =>
          onChange({ target: { name: "yearOfAssembly", value } })
        }
        options={years}
      />
    </div>
  );
};

export default CarPapers;
