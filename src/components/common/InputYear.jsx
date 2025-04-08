// components/common/InputYear.jsx
import React from "react";
import { formatYear } from "@/utils/formatYear";

const InputYear = ({
  id,
  name,
  value,
  onChange,
  label,
  error = "",
  className = "",
  isHomeRoute = false,
  ...props
}) => {
  const handleInputChange = (event) => {
    const rawValue = event.target.value;
    const formattedValue = formatYear(rawValue);
    const syntheticEvent = { target: { name: name, value: formattedValue } };
    onChange(syntheticEvent);
  };

  const baseInputClasses =
    "block w-full pt-3 pb-2 px-3 text-sm border rounded-xl focus:outline-none peer";
  const errorClasses = error
    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
    : "border-gray-300 focus:border-orange-300 focus:ring-orange-300";

  const labelClasses = `
    absolute left-4 top-3.5 text-gray-500 text-xs
    transition-all duration-200 ease-in-out
    pointer-events-none
    peer-focus:-translate-y-5 peer-focus:left-3 peer-focus:px-1 peer-focus:bg-white
    peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:bg-white
    ${error ? "text-red-500" : "peer-focus:text-orange-300"}
  `;

  return (
    <div className="w-full mt-1">
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          id={id}
          name={name}
          value={value}
          onChange={handleInputChange}
          maxLength={4}
          placeholder=" "
          className={`${baseInputClasses} ${errorClasses} ${className}`}
          {...props}
        />

        <label htmlFor={id} className={labelClasses}>
          {label}
        </label>
      </div>

      {/* pesan error */}
      <div className={`mt-1 ${isHomeRoute ? "min-h-[1rem]" : ""}`}>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default InputYear;
