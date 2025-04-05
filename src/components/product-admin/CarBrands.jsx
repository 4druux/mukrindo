// components/product/CarBrands.jsx
import { useState, useEffect } from "react";
import Select from "../common/Select";

const CarBrands = ({ carData, brand, model, variant, onChange }) => {
  const [filteredModels, setFilteredModels] = useState([]);
  const [filteredVariants, setFilteredVariants] = useState([]);

  useEffect(() => {
    if (brand) {
      const models = carData[brand] ? Object.keys(carData[brand]) : [];
      setFilteredModels(models);
    } else {
      setFilteredModels([]);
    }
  }, [brand, carData]);

  useEffect(() => {
    if (brand && model) {
      const variants = carData[brand]?.[model] || [];
      setFilteredVariants(variants);
    } else {
      setFilteredVariants([]);
    }
  }, [brand, model, carData]);

  const brandOptions = Object.keys(carData).map((b) => ({
    value: b,
    label: b,
  }));
  const modelOptions = filteredModels.map((m) => ({ value: m, label: m }));
  const variantOptions = filteredVariants.map((v) => ({ value: v, label: v }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Select
        label="Merek Mobil"
        id="brand"
        name="brand"
        value={brand}
        title="Merek Mobil"
        description="Pilih Merek Mobil"
        onChange={(value) => onChange("brand", value, "", "")}
        options={brandOptions}
      />
      <Select
        label="Model Mobil"
        id="model"
        name="model"
        value={model}
        title="Model Mobil"
        description="Pilih Model Mobil"
        onChange={(value) => onChange("model", value, variant, "")}
        options={modelOptions}
        disabled={!brand}
      />
      <Select
        label="Varian Mobil"
        id="variant"
        name="variant"
        value={variant}
        title="Varian Mobil"
        description="Pilih Varian Mobil"
        onChange={(value) => onChange("variant", value, model, brand)}
        options={variantOptions}
        disabled={!model}
      />
    </div>
  );
};

export default CarBrands;
