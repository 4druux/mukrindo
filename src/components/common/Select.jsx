// components/common/Select.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const Select = ({ label, options, value, onChange, description, title }) => {
  // Added title prop
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleOptionClick = (selectedValue) => {
    onChange(selectedValue);
    setIsDropdownOpen(false);
  };

  const dropDownVariant = {
    open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`mt-1 flex items-center justify-between border rounded-xl shadow-sm text-sm py-2.5 px-3 cursor-pointer ${
          isDropdownOpen ? "border-orange-500" : "border-gray-300"
        }`}
      >
        <span className="text-xs">
          {value
            ? options.find((opt) => opt.value === value)?.label || value
            : `Pilih ${label}`}
        </span>
        <div
          className={`w-4 h-4 transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {/* Options list */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={dropDownVariant}
            className="absolute p-3 z-20 mt-1 w-full bg-white border border-gray-300 rounded-2xl shadow-lg"
          >
            <div className="px-3 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                {title && (
                  <span className="font-semibold text-sm">{title}</span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(!isDropdownOpen);
                    onChange("");
                  }}
                  className="text-red-600 hover:underline text-sm cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {/* Description (Optional, below title) */}
              {description && (
                <span className="block text-xs text-gray-500 my-2">
                  {description}
                </span>
              )}
              <div className="border-b-2 border-gray-300" />
            </div>

            {/* Scrollable Options Container */}
            <div
              className="overflow-y-auto max-h-52 mt-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center text-sm justify-between py-2 px-3 hover:bg-gray-100 cursor-pointer"
                >
                  <span>{option.label}</span>
                  <input
                    type="radio"
                    name={label}
                    value={option.value}
                    checked={value === option.value}
                    onChange={() => handleOptionClick(option.value)}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded-full"
                  />
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Select;
