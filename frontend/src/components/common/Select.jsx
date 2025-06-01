// frontend/src/components/common/Select.jsx
"use client";
import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, X, PlusCircle } from "lucide-react";
import Image from "next/image";
import DotLoader from "./DotLoader";

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
      allowAdd = false,
      onAddOption,
      inputClassName = "text-sm",
      disabled = false,
      itemActions,
      isActionInProgress = false,
    },
    ref
  ) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    useImperativeHandle(ref, () => ({
      openDropdown: () => {
        setIsDropdownOpen(true);
      },
      focusInput: () => {
        if (searchOption && dropdownRef.current) {
          const searchInput =
            dropdownRef.current.querySelector('input[type="text"]');
          if (searchInput) searchInput.focus();
        } else if (dropdownRef.current) {
          dropdownRef.current.querySelector("button")?.focus();
        }
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

    const handleReset = (e) => {
      e.stopPropagation();
      onChange("");
      setIsDropdownOpen(false);
      setSearchTerm("");
    };

    const handleClearSearch = (e) => {
      e.stopPropagation();
      setSearchTerm("");
    };

    const handleAddNewOption = (e) => {
      e.stopPropagation();
      if (searchTerm.trim() && onAddOption) {
        onAddOption(searchTerm.trim());
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    };

    const filteredOptions = searchOption
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

    const showAddNewOption =
      allowAdd &&
      searchOption &&
      searchTerm.trim() &&
      !filteredOptions.some(
        (opt) => opt.label.toLowerCase() === searchTerm.trim().toLowerCase()
      );

    const dropDownVariant = {
      open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
      closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
    };

    const selectedOptionLabel =
      options.find((opt) => opt.value === value)?.label || value || "";

    return (
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled || isActionInProgress}
          className={`mt-1 flex items-center justify-between w-full border rounded-xl py-2.5 px-3 cursor-pointer text-left
            ${isDropdownOpen ? "border-orange-300" : "border-gray-300"}
            ${
              disabled || isActionInProgress
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white"
            }
            ${error ? "border-red-500" : ""}`}
        >
          <span className={`flex items-center gap-1 ${inputClassName}`}>
            {value ? (
              <>
                {options.find((opt) => opt.value === value)?.hex && (
                  <span
                    className="w-4 h-4 inline-block shadow-sm rounded-sm"
                    style={{
                      backgroundColor: options.find(
                        (opt) => opt.value === value
                      )?.hex,
                    }}
                  ></span>
                )}
                {options.find((opt) => opt.value === value)?.ImgUrl && (
                  <Image
                    src={options.find((opt) => opt.value === value)?.ImgUrl}
                    alt={selectedOptionLabel}
                    width={16}
                    height={16}
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span className={value ? "text-gray-900" : "text-gray-500"}>
                  {selectedOptionLabel || `Pilih ${label}`}
                </span>
              </>
            ) : (
              <span className="text-gray-400">{`Pilih ${label}`}</span>
            )}
          </span>

          <div
            className={`w-4 h-4 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          >
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={dropDownVariant}
              className="absolute p-3 z-20 mt-1 w-full bg-white border border-gray-300 rounded-2xl shadow-lg"
            >
              {isActionInProgress ? (
                <div className="flex justify-center items-center py-10">
                  <DotLoader />
                </div>
              ) : (
                <>
                  <div className="px-3 sticky top-0 z-10 bg-white pt-1">
                    <div className="flex items-center justify-between">
                      {title && (
                        <span className="font-normal text-sm text-gray-700">
                          {title}
                        </span>
                      )}
                      {value && (
                        <button
                          type="button"
                          onClick={handleReset}
                          className="text-red-600 hover:underline text-sm cursor-pointer font-medium"
                        >
                          Reset
                        </button>
                      )}
                    </div>
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
                          className="w-full border border-gray-300 rounded-full px-3 py-1.5 my-2 text-sm placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-orange-300"
                        />
                        {searchTerm && (
                          <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer my-2"
                            aria-label="Hapus pencarian"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                    <div className="border-b-2 border-gray-300 mb-1" />
                  </div>

                  <div
                    className="overflow-y-auto max-h-52 mt-1"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {showAddNewOption && (
                      <div
                        onClick={handleAddNewOption}
                        className="flex items-center gap-2 py-2 px-3 hover:bg-green-50 text-green-600 cursor-pointer rounded-full text-sm"
                      >
                        <PlusCircle size={16} />
                        Tambah "{searchTerm.trim()}"
                      </div>
                    )}
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center justify-between hover:bg-gray-100 rounded-lg group"
                        >
                          <label className="flex-grow flex items-center text-sm py-2 px-3 cursor-pointer">
                            <div className="flex items-center gap-2">
                              {option.hex && (
                                <span
                                  className="w-4 h-4 inline-block shadow-sm rounded-sm"
                                  style={{ backgroundColor: option.hex }}
                                ></span>
                              )}
                              {option.ImgUrl && (
                                <Image
                                  src={option.ImgUrl}
                                  alt={option.label}
                                  width={20}
                                  height={20}
                                  className="w-5 h-5 object-contain"
                                />
                              )}
                              <span
                                className={
                                  value === option.value
                                    ? "text-orange-600 font-semibold"
                                    : "text-gray-800"
                                }
                              >
                                {option.label}
                              </span>
                            </div>
                            <input
                              type="radio"
                              name={label.replace(/\s+/g, "-").toLowerCase()}
                              value={option.value}
                              checked={value === option.value}
                              onChange={() => handleOptionClick(option.value)}
                              className="form-radio h-4 w-4 accent-orange-600 ml-auto"
                            />
                          </label>

                          {itemActions && option.canDelete && (
                            <div className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {itemActions(option.value, option.label)}
                            </div>
                          )}
                        </div>
                      ))
                    ) : !showAddNewOption ? (
                      <div className="text-center text-sm text-gray-500 py-2 px-3">
                        Tidak ada hasil ditemukan.
                      </div>
                    ) : null}
                  </div>
                </>
              )}
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
