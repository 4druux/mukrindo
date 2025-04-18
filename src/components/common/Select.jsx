// components/common/Select.jsx
"use client";
import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";

const Select = forwardRef(
  (
    {
      label,
      options,
      value,
      onChange,
      description,
      title,
      searchOption = false,
      error = "",
    },
    ref
  ) => {
    // Added title prop
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    useImperativeHandle(ref, () => ({
      openDropdown: () => {
        setIsDropdownOpen(true);
      },
    }));

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
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
      setSearchTerm("");
    };

    const handleReset = () => {
      onChange("");
      setIsDropdownOpen(false);
      setSearchTerm("");
    };

    const handleClearSearch = (e) => {
      e.stopPropagation();
      setSearchTerm("");
    };

    const filteredOptions = searchOption
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

    const dropDownVariant = {
      open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
      closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
    };

    return (
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`mt-1 flex items-center justify-between border rounded-xl text-sm py-2.5 px-3 cursor-pointer ${
            isDropdownOpen ? "border-orange-300" : "border-gray-300"
          } ${error ? " border-red-500" : "border-gray-300"}`}
        >
          <span className="text-sm flex items-center gap-1">
            {value ? (
              <>
                {options.find((opt) => opt.value === value)?.hex && (
                  <span
                    className="w-4 h-4 inline-block shadow-sm"
                    style={{
                      backgroundColor: options.find(
                        (opt) => opt.value === value
                      )?.hex,
                    }}
                  ></span>
                )}
                {options.find((opt) => opt.value === value)?.ImgUrl && (
                  <img
                    src={options.find((opt) => opt.value === value)?.ImgUrl}
                    alt={options.find((opt) => opt.value === value)?.label}
                    className="w-4 h-4 object-cover"
                  />
                )}
                {options.find((opt) => opt.value === value)?.label || value}
              </>
            ) : (
              `Pilih ${label}`
            )}
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
                    <span className="font-normal text-sm">
                      {title}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleReset}
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

                {searchOption && (
                  <div className="relative my-2">
                    <input
                      type="text"
                      placeholder={`Cari ${label}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full border border-gray-300 rounded-full px-2 py-1 my-2 text-sm placeholder:text-xs
                  focus:outline-none focus:ring-1 focus:ring-orange-300"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600 cursor-pointer" // Posisi absolut di kanan
                        aria-label="Hapus pencarian"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                <div className="border-b-2 border-gray-300" />
              </div>

              {/* Scrollable Options Container */}
              <div
                className="overflow-y-auto max-h-52 mt-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center text-sm justify-between py-2 px-3 hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {option.hex && (
                          <span
                            className="w-4 h-4 inline-block shadow-sm"
                            style={{ backgroundColor: option.hex }}
                          ></span>
                        )}

                        {option.ImgUrl && (
                          <img
                            src={option.ImgUrl}
                            alt={option.label}
                            className="w-5 h-5 object-cover"
                          />
                        )}

                        <span>{option.label}</span>
                      </div>

                      <input
                        type="radio"
                        name={label}
                        value={option.value}
                        checked={value === option.value}
                        onChange={() => handleOptionClick(option.value)}
                        className="form-radio h-4 w-4 accent-orange-600"
                      />
                    </label>
                  ))
                ) : (
                  <div className="text-center text-sm text-gray-500 py-2 px-3">
                    Tidak ada hasil ditemukan.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-1 min-h-[1rem]">
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
