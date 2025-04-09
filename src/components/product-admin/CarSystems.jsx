// components/product/CarSystems.jsx
"use client";
import React from "react";
import Select from "../common/Select";

const CarSystems = ({
  data,
  onChange,
  errors,
  driveSystemRef,
  transmissionRef,
  fuelTypeRef,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Sistem Penggerak */}
      <Select
        ref={driveSystemRef}
        label="Sistem Penggerak"
        id="driveSystem"
        name="driveSystem"
        value={data.driveSystem}
        error={errors.driveSystem}
        title="Sistem Penggerak"
        description="Jenis Sistem Penggerak"
        onChange={(value) =>
          onChange({ target: { name: "driveSystem", value } })
        }
        options={[
          {
            value: "rwd 4x2",
            label: "RWD 4x2",
          },
          {
            value: "fwd 4x2",
            label: "FWD 4x2",
          },
          { value: "awd 4x4", label: "AWD 4x4" },
          { value: "4wd 4x4", label: "4WD 4x4" },
        ]}
      />
      {/* Transmisi */}
      <Select
        ref={transmissionRef}
        label="Transmisi"
        id="transmission"
        name="transmission"
        value={data.transmission}
        error={errors.transmission}
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
        ref={fuelTypeRef}
        label="Bahan Bakar"
        id="fuelType"
        name="fuelType"
        value={data.fuelType}
        error={errors.fuelType}
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
