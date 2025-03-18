// components/Header.js
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdPersonOutline, MdKeyboardArrowDown } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { HiMenuAlt3 } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/layout/user/SearchBar";
import { useHeader } from "@/context/HeaderContext"; // Import useHeader

function AppHeader() {
  const { isSearchOpen, toggleSearch } = useHeader(); // Langsung gunakan useHeader()
  const [isTop, setIsTop] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsTop(window.scrollY <= 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const dropDownVariant = {
    open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 ${
          isTop ? "bg-gray-50" : "shadow-md bg-white"
        }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-[6vw] md:px-[9vw] lg:px-[10vw] py-3 lg:py-6">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center">
              <Image
                src="/images/logo/logo.svg"
                alt="MukrindoLogo"
                width={150}
                height={40}
                className="cursor-pointer"
              />
            </div>
          </Link>

          {/* Navigation and Icons */}
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-orange-600"
              >
                Beranda
              </Link>

              {/* Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`text-sm font-medium  hover:text-orange-600 flex items-center gap-1 group ${
                    isDropdownOpen ? "text-orange-600" : "text-gray-700"
                  }`}
                >
                  Beli Mobil
                  <motion.span
                    className="inline-block"
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ transformOrigin: "center" }}
                  >
                    <MdKeyboardArrowDown
                      className={`group-hover:text-orange-600 ${
                        isDropdownOpen ? "text-orange-600" : "text-gray-700"
                      }`}
                    />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={dropDownVariant}
                      className={`absolute -left-10 top-full border border-neutral-100 shadow-md rounded-lg py-2 mt-4 z-10 min-w-[160px] ${
                        isTop ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <Link
                        href="/beli-mobil/baru"
                        className="block px-4 py-2 text-sm  text-neutral-600 hover:text-orange-600 hover:bg-orange-50"
                      >
                        Mobil Bekas
                      </Link>
                      <Link
                        href="/beli-mobil/bekas"
                        className="block px-4 py-2 text-sm  text-neutral-600 hover:text-orange-600 hover:bg-orange-50"
                      >
                        Simulasi Budget
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/jual-mobil"
                className="text-sm font-medium text-gray-700 hover:text-orange-600"
              >
                Jual Mobil
              </Link>
              <Link
                href="/tukar-tambah"
                className="text-sm font-medium text-gray-700 hover:text-orange-600 relative"
              >
                Tukar Tambah
              </Link>
            </div>

            <div className="border-l border-gray-400 h-7 mx-4" />

            {/* Icons */}
            <div className="flex items-center space-x-4">
              {/* Search Icon */}
              <FiSearch
                className="w-5 h-5 text-gray-600 hover:text-orange-600 cursor-pointer"
                onClick={toggleSearch} // Buka/tutup search bar
              />
              <span className="relative flex space-x-2 rounded-full py-2 px-4 bg-gray-100">
                <MdPersonOutline className="w-6 h-6 text-gray-700 hover:text-orange-600 cursor-pointer" />
                <HiMenuAlt3 className="w-6 h-6 text-gray-700 hover:text-orange-600 cursor-pointer" />
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Render SearchBar conditionally */}
      <SearchBar />
    </>
  );
}

export default AppHeader;
