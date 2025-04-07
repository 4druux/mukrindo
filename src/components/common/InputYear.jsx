// components/common/InputYear.jsx
import React from "react";
import { formatYear } from "@/utils/formatYear";
import AnimatedPlaceholder from "./AnimatedPlaceholder";

const InputYear = ({
  id,
  name,
  value,
  onChange,
  placeholderTexts,
  error = "",
  className = "",
  ...props
}) => {
  const hasValue = value && value.length > 0;

  const handleInputChange = (event) => {
    const rawValue = event.target.value;
    const formattedValue = formatYear(rawValue);

    const syntheticEvent = {
      target: {
        name: name,
        value: formattedValue,
      },
    };

    onChange(syntheticEvent);
  };

  const baseInputClasses =
    "block mt-1 w-full py-2 px-3 text-sm border rounded-xl focus:outline-none ";
  // Kelas untuk error state
  const errorInputClasses = error
    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
    : "border-gray-300 focus:border-orange-300 focus:ring-orange-300";

  return (
    <div className="w-full">
      <div className="relative overflow-hidden">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          id={id}
          name={name}
          value={value}
          onChange={handleInputChange}
          maxLength={4}
          className={`${baseInputClasses} ${errorInputClasses} ${className}`}
          {...props}
        />
        {placeholderTexts && !hasValue && (
          <AnimatedPlaceholder
            className="left-4 pointer-events-none"
            placeholderTexts={placeholderTexts}
          />
        )}
      </div>
      {/* Tampilkan pesan error jika ada */}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default InputYear;
