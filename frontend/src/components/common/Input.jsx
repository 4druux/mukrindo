// components/common/Input.jsx
import React, { forwardRef } from "react";
import AnimatedPlaceholder from "./AnimatedPlaceholder";

const Input = forwardRef(
  (
    {
      label,
      id,
      name,
      value,
      onChange,
      type = "text",
      formatter,
      prefix,
      className = "",
      error = "",
      placeholderTexts,
      ...props
    },
    ref
  ) => {
    const formattedValue = formatter ? formatter(value, prefix) : value;
    const hasValue = formattedValue && formattedValue.length > 0;

    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative overflow-hidden">
          <input
            ref={ref}
            type={type}
            id={id}
            name={name}
            value={formattedValue ?? ""}
            onChange={onChange}
            className={`mt-1 block w-full border focus:outline-none focus:border-orange-300 rounded-xl text-base lg:text-sm py-2 px-3 ${
              error ? "border-red-500 focus:border-red-500" : "border-gray-300"
            }`}
            {...props}
          />
          {placeholderTexts && !hasValue && (
            <AnimatedPlaceholder
              className="left-4 pointer-events-none"
              placeholderTexts={placeholderTexts}
            />
          )}
        </div>

        {/* pesan error */}
        <div className="mt-1 min-h-[1rem]">
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
