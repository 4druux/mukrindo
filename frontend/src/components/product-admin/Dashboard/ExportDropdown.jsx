"use client";
import react, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEllipsis } from "react-icons/fa6";

const dropDownVariant = {
  open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const ExportDropdown = ({ onExport, className = "" }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target) &&
        !event.target.closest(".export-button")
      ) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportClick = (type) => {
    onExport(type);
    setShowExportMenu(false);
  };

  return (
    <div className={`relative ${className}`} ref={exportMenuRef}>
      <button
        onClick={() => setShowExportMenu(!showExportMenu)}
        className="text-gray-500 hover:text-gray-700 p-2 cursor-pointer hover:bg-gray-100 rounded-full focus:outline-none export-button"
        aria-label="Opsi Ekspor"
      >
        <FaEllipsis className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {showExportMenu && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={dropDownVariant}
            className="absolute right-0 mt-2 w-max bg-white border border-gray-200 rounded-md shadow-lg z-10"
          >
            <ul className="text-xs font-medium text-gray-700">
              <li>
                <button
                  onClick={() => handleExportClick("PDF")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Download PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleExportClick("CSV")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Download CSV
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportDropdown;
