// components/Header.js
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MdSearch,
  MdFavoriteBorder,
  MdPersonOutline,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { HiMenuAlt3 } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion

function AppHeader() {
  const [isTop, setIsTop] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State untuk dropdown
  const dropdownRef = useRef(null); // Ref untuk dropdown

  // Efek untuk sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsTop(window.scrollY <= 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Efek untuk menutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside); // Gunakan mousedown

    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Bersihkan event listener
    };
  }, [dropdownRef]); // Dependensi: dropdownRef

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        isTop ? "" : "shadow-sm"
      }`}
    >
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 sm:gap-4 lg:justify-normal lg:px-0 lg:py-6">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center">
              <Image
                src="/images/logo/logo.svg"
                alt="Mukrindo Logo"
                width={150}
                height={40}
                className="cursor-pointer"
              />
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-grow mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Jual Mobil"
                className="w-full pl-10 pr-4 py-2 rounded-full bg-neutral-100"
              />
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xl" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Navigation Links (Desktop) */}
            <nav className="hidden md:flex items-center space-x-10">
              {/* Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`text-sm font-medium  hover:text-blue-600 flex items-center gap-1 group ${
                    isDropdownOpen ? "text-blue-600" : "text-gray-700"
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
                      className={`group-hover:text-blue-600 ${
                        isDropdownOpen ? "text-blue-600" : "text-gray-700"
                      }`}
                    />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute -left-10 top-full bg-white border border-neutral-100 shadow-md rounded-lg py-2 mt-4 z-10 min-w-[160px]"
                    >
                      <Link
                        href="/beli-mobil/baru"
                        className="block px-4 py-2 text-sm font-medium text-neutral-600 hover:text-blue-600 hover:bg-blue-50"
                      >
                        Mobil Bekas
                      </Link>
                      <Link
                        href="/beli-mobil/bekas"
                        className="block px-4 py-2 text-sm font-medium text-neutral-600 hover:text-blue-600 hover:bg-blue-50"
                      >
                        Simulasi Budget
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link
                href="/jual-mobil"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Jual Mobil
              </Link>
              <Link
                href="/tukar-tambah"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 relative"
              >
                Tukar Tambah
              </Link>
            </nav>
            {/* Separator */}
            <div className="hidden md:block border-l-2 border-neutral-300 h-6" />
            {/* Icons (Desktop) */}
            <div className="hidden md:flex items-center space-x-6">
              <MdFavoriteBorder className="text-2xl cursor-pointer" />
              <span className="relative flex space-x-2 bg-neutral-100 rounded-full py-2 px-4">
                <MdPersonOutline className="text-2xl text-gray-700 hover:text-blue-600 cursor-pointer" />
                <HiMenuAlt3 className="text-2xl text-gray-700 hover:text-blue-600 cursor-pointer" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
