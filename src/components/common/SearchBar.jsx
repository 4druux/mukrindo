// components/SearchBar.js
import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useHeader } from "@/context/HeaderContext";
import SearchModal from "./SearchModal";

const SearchBar = () => {
  const { isSearchOpen, searchQuery, setSearchQuery, toggleSearch } =
    useHeader();
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholderTexts = [
    "Beli mobil bekas terbaru",
    "Jual mobil saya",
    "Tukar tambah mobil",
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlaceholderIndex(
        (prevIndex) => (prevIndex + 1) % placeholderTexts.length
      );
    }, 3000);
    return () => clearInterval(intervalId);
  }, [placeholderTexts.length]);

  useEffect(() => {
    document.body.style.overflow = isSearchOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSearchOpen]);

  const containerVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  const handleClearSearch = () => setSearchQuery("");

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/20 z-[50]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={toggleSearch}
          />
          <motion.div
            className="fixed inset-x-0 top-16 md:top-20 z-[51]"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={toggleSearch}
          >
            <div className="flex flex-col items-center justify-center">
              <div
                className="border bg-white border-gray-400 px-5 py-2 my-4 rounded-full shadow-lg w-full sm:w-1/2 h-10 flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative flex-1 overflow-hidden">
                  {/* Kondisi: Tampilkan animasi HANYA jika searchQuery kosong */}
                  {searchQuery === "" && (
                    <AnimatePresence>
                      <motion.span
                        key={placeholderIndex}
                        className="absolute inset-0 flex items-center text-xs text-gray-600"
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "-100%" }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        {placeholderTexts[placeholderIndex]}
                      </motion.span>
                    </AnimatePresence>
                  )}
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="relative z-10 w-full h-full outline-none bg-transparent text-sm"
                    type="text"
                    placeholder="" 
                  />
                </div>
                {searchQuery && (
                  <button
                    className="hover:bg-slate-100 rounded-full p-1 group mr-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearSearch();
                    }}
                  >
                    <X className="w-5 text-gray-700 group-hover:text-gray-900" />
                  </button>
                )}
                <div
                  className="border-l-2 border-gray-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Search className="w-5 ml-2 text-gray-700 cursor-pointer" />
                </div>
              </div>
              <SearchModal />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchBar;
