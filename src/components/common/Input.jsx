// components/common/Input.jsx
import React from "react";
import AnimatedPlaceholder from "./AnimatedPlaceholder";

const Input = ({
  label,
  id,
  name,
  value,
  onChange,
  type = "text",
  formatter,
  prefix,
  placeholderTexts,
  ...props
}) => {
  const formattedValue = formatter ? formatter(value, prefix) : value;
  const hasValue = formattedValue && formattedValue.length > 0;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative overflow-hidden">
        <input
          type={type}
          id={id}
          name={name}
          value={formattedValue}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-xl text-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          {...props}
        />
        {placeholderTexts && !hasValue && (
          <AnimatedPlaceholder
            className="left-4 pointer-events-none"
            placeholderTexts={placeholderTexts}
          />
        )}
      </div>
    </div>
  );
};

export default Input;
