// frontend/src/components/common/InputPassword.jsx
"use client";
import React, { useState, forwardRef } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";

const InputPassword = forwardRef(
  (
    {
      label,
      id,
      name,
      value,
      onChange,
      error = "",
      placeholder,
      autoComplete,
      className = "",
      disabled = false,
      inputClassName = "",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const baseInputClasses =
      "block w-full text-base lg:text-sm border rounded-lg focus:outline-none pr-10 placeholder-gray-400/70 ";
    const errorClasses = error
      ? "border-red-500 focus:border-red-500"
      : "border-gray-300 focus:border-orange-300";
    const disabledClasses = disabled
      ? "bg-gray-100 cursor-not-allowed text-gray-500"
      : "bg-white";

    return (
      <div className={className}>
        <label
          htmlFor={id}
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            disabled={disabled}
            className={`px-4 py-2 ${baseInputClasses} ${errorClasses} ${disabledClasses} ${inputClassName}`}
            {...props}
          />
          <span
            onClick={() => !disabled && setShowPassword(!showPassword)}
            className={`absolute z-10 -translate-y-1/2 cursor-pointer right-3 top-1/2 p-1 rounded-full hover:bg-gray-100 
              ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            aria-label={
              showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
            }
          >
            {showPassword ? (
              <IoEye
                className={`w-5 h-5 ${
                  disabled ? "text-gray-400" : "text-gray-500"
                }`}
              />
            ) : (
              <IoEyeOff
                className={`w-5 h-5 ${
                  disabled ? "text-gray-400" : "text-gray-500"
                }`}
              />
            )}
          </span>
        </div>
        <div className="mt-1 min-h-[1rem]">
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    );
  }
);

InputPassword.displayName = "InputPassword";
export default InputPassword;
