// components/common/RangePrice.js
import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { formatNumber } from "@/utils/formatNumber";

const RangePrice = ({ value, onChange, min = 50000000, max = 1500000000 }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Harga</label>
      <Slider
        range
        min={min}
        max={max}
        step={10000000}
        defaultValue={value}
        value={value}
        onChange={onChange}
        trackStyle={[{ backgroundColor: "#f97316" }]}
        handleStyle={[
          { borderColor: "#f97316", backgroundColor: "#f97316" },
          { borderColor: "#f97316", backgroundColor: "#f97316" },
        ]}
      />
      <div className="flex justify-between text-sm text-gray-700">
        <span>{formatNumber(value[0], "Rp ")}</span>
        <span>-</span>
        <span>{formatNumber(value[1], "Rp ")}</span>
      </div>
    </div>
  );
};

export default RangePrice;
