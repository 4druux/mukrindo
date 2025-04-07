// components/product/CarPapers.jsx
"use client";
import React from "react";
import Select from "../common/Select";
import Input from "../common/Input";

const CarPapers = ({ data, onChange }) => {
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
        label="Masa Berlaku STNK"
        id="stnkExpiry"
        name="stnkExpiry"
        placeholderTexts={[
          "Masa Berlaku STNK anda",
          "Masa Berlaku STNK anda",
          "Masa Berlaku STNK anda",
        ]}
        value={data.stnkExpiry}
        onChange={(e) => onChange(e)}
      />
      {/* Plat Nomor */}
      <Select
        label="Plat Nomor"
        id="plateNumber"
        name="plateNumber"
        value={data.plateNumber}
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
        label="Tahun Perakitan"
        id="yearOfAssembly"
        name="yearOfAssembly"
        value={data.yearOfAssembly}
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
