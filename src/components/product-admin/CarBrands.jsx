// components/product/CarBrands.jsx
import { useState, useEffect } from "react";
import Select from "../common/Select";

const CarBrands = ({ carData, brand, model, variant, onChange }) => {
  const [filteredModels, setFilteredModels] = useState([]);
  const [filteredVariants, setFilteredVariants] = useState([]);

  useEffect(() => {
    if (brand && carData[brand]?.Model) {
      const models = Object.keys(carData[brand].Model);
      setFilteredModels(models);
    } else {
      setFilteredModels([]);
    }
  }, [brand, carData]);

  useEffect(() => {
    if (brand && model && carData[brand]?.Model?.[model]) {
      const variants = carData[brand].Model[model];
      setFilteredVariants(variants);
    } else {
      setFilteredVariants([]);
    }
  }, [brand, model, carData]);

  const brandOptions = Object.keys(carData).map((b) => ({
    value: b,
    label: b,
    ImgUrl: carData[b].ImgUrl,
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
        searchOption={true}
      />
      <Select
        label="Model Mobil"
        id="model"
        name="model"
        value={model}
        title="Model Mobil"
        description={
          brand ? "Pilih Model Mobil" : "Pilih Merek Mobil Terlebih Dahulu!"
        }
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
        description={
          model ? "Pilih Varian Mobil" : "Pilih Model Mobil Terlebih Dahulu!"
        }
        onChange={(value) => onChange("variant", value, model, brand)}
        options={variantOptions}
        disabled={!model}
      />
    </div>
  );
};

export default CarBrands;
