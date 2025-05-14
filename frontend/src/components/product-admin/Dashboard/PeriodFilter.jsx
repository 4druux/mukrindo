import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";

const PeriodFilter = ({
  currentYear,
  setCurrentYear,
  selectedTab,
  setSelectedTab,
  webTrafficChart = false,
  tabs = ["Minggu", "Bulan", "Tahun"],
}) => {
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const yearDropdownRef = useRef(null);

  const adjustedTabs = webTrafficChart ? ["Hari", ...tabs] : tabs;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target)
      ) {
        setIsYearDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [yearDropdownRef]);

  const dropDownVariant = {
    open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-gray-100 p-1 w-full sm:w-auto">
      {adjustedTabs.map((tab) =>
        tab === "Bulan" ? (
          <div key={tab} className="relative" ref={yearDropdownRef}>
            <button
              onClick={() => {
                setSelectedTab("Bulan");
                setIsYearDropdownOpen(!isYearDropdownOpen);
              }}
              className={`px-3 py-1.5 font-semibold w-full rounded-full text-xs cursor-pointer transition-colors duration-150 flex items-center justify-center gap-1 whitespace-nowrap ${
                selectedTab === tab
                  ? `${
                      webTrafficChart ? "text-emerald-600" : "text-orange-600"
                    } bg-white shadow-sm`
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab} {currentYear}
              <FaChevronDown
                className={`h-3 w-3 transition-transform ${
                  isYearDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {isYearDropdownOpen && selectedTab === "Bulan" && (
                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={dropDownVariant}
                  className="absolute z-20 mt-1 right-0 w-full min-w-[80px] rounded-xl bg-white shadow-lg border border-gray-200 max-h-48 overflow-y-auto"
                >
                  <ul className="py-1">
                    {Array.from(
                      { length: 6 },
                      (_, i) => new Date().getFullYear() - 5 + i + 1
                    )
                      .sort((a, b) => b - a)
                      .map((year) => (
                        <li
                          key={year}
                          onClick={() => {
                            setCurrentYear(year);
                            setIsYearDropdownOpen(false);
                          }}
                          className={`px-3 py-1.5 text-xs text-center cursor-pointer ${
                            year === currentYear
                              ? `${
                                  webTrafficChart
                                    ? "text-emerald-600 bg-emerald-50"
                                    : "text-orange-600 bg-orange-50"
                                } font-semibold`
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {year}
                        </li>
                      ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            key={tab}
            onClick={() => {
              setSelectedTab(tab);
              setIsYearDropdownOpen(false);
            }}
            className={`px-3 py-1.5 font-semibold w-full rounded-full text-xs cursor-pointer transition-colors duration-150 ${
              selectedTab === tab
                ? `${
                    webTrafficChart ? "text-emerald-600" : "text-orange-600"
                  } bg-white shadow-sm`
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        )
      )}
    </div>
  );
};

export default PeriodFilter;
