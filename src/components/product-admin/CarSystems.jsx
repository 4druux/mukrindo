// components/product/CarSystems.jsx
"use client";
import React from "react";
import Select from "../common/Select";

const CarSystems = ({ data, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Sistem Penggerak */}
      <Select
        label="Sistem Penggerak"
        id="driveSystem"
        name="driveSystem"
        value={data.driveSystem}
        title="Sistem Penggerak"
        description="Jenis Sistem Penggerak"
        onChange={(value) =>
          onChange({ target: { name: "driveSystem", value } })
        }
        options={[
          { value: "rwd", label: "RWD" },
          { value: "fwd", label: "FWD" },
          { value: "awd", label: "AWD" },
          { value: "4wd", label: "4WD" },
        ]}
      />
      {/* Transmisi */}
      <Select
        label="Transmisi"
        id="transmission"
        name="transmission"
        value={data.transmission}
        title="Transmisi"
        description="Jenis Transmisi"
        onChange={(value) =>
          onChange({ target: { name: "transmission", value } })
        }
        options={[
          { value: "manual", label: "Manual" },
          { value: "automatic", label: "Automatic" },
          { value: "cvt", label: "CVT" },
        ]}
      />
      {/* Bahan Bakar */}
      <Select
        label="Bahan Bakar"
        id="fuelType"
        name="fuelType"
        value={data.fuelType}
        title="Bahan Bakar"
        description="Jenis Bahan Bakar"
        onChange={(value) => onChange({ target: { name: "fuelType", value } })}
        options={[
          { value: "bensin", label: "Bensin" },
          { value: "solar", label: "Solar" },
          { value: "hybrid", label: "Hybrid" },
        ]}
      />
    </div>
  );
};

export default CarSystems;
