// components/Header.js
"use client";

import  { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdPersonOutline, MdKeyboardArrowDown } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { HiMenuAlt3 } from "react-icons/hi";
import {
  FaHome,
  FaShoppingBag,
  FaKey,
  FaMoneyBillWaveAlt,
} from "react-icons/fa";
import { FaArrowsRotate } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/layout/user/SearchBar";
import { useHeader } from "@/context/HeaderContext";

function AppHeader() {
  const { isSearchOpen, toggleSearch } = useHeader();
  const [isTop, setIsTop] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "/";

  useEffect(() => {
    const handleScroll = () => setIsTop(window.scrollY <= 50);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const dropDownVariant = {
    open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const navHeight = 80;
  const notchWidth = 10; // Lebar lekukan (sesuaikan sedikit jika perlu agar pas dengan tombol oranye)
  const notchDepth = 90; // Konstanta ini tetap ada, tapi tidak dipakai langsung untuk kedalaman Q
  const cornerRadius = 24;

  // --- INI KUNCINYA ---
  const effectiveNotchDepth = 80; // <<-- COBA UBAH NILAI INI (misal: 20, 25, 30)
  // ---

  // Hitung titik X awal dan akhir lekukan
  const notchStartX = 140 - notchWidth / 2; // 120
  const notchEndX = 180 + notchWidth / 2; // 180

  const svgPath = `
    M 0 ${cornerRadius}
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${cornerRadius} 0
    L ${notchStartX} 0                       
    Q 150 ${effectiveNotchDepth}, ${notchEndX} 0 
    L ${300 - cornerRadius} 0               
    A ${cornerRadius} ${cornerRadius} 0 0 1 300 ${cornerRadius}
    L 300 ${navHeight}
    L 0 ${navHeight}
    Z
  `;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-colors duration-300 ${
          isTop ? "bg-gray-50" : "shadow-md bg-white"
        }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-[6vw] md:px-[9vw] lg:px-[10vw] py-3 lg:py-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center">
              <Image
                src="/images/logo/logo.svg"
                alt="MukrindoLogo"
                width={130}
                height={35}
                className="cursor-pointer lg:w-[150px] lg:h-[40px]"
              />
            </div>
          </Link>

          <div className="flex items-center justify-end">
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className={`text-sm font-medium hover:text-orange-600 ${
                  pathname === "/" ? "text-orange-600" : "text-gray-700"
                }`}
              >
                Beranda
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`text-sm font-medium  hover:text-orange-600 flex items-center gap-1 group cursor-pointer ${
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
                      className={`absolute -left-10 top-full border border-gray-100 shadow-md rounded-lg py-2 mt-4 z-10 min-w-[160px] ${
                        isTop ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <Link
                        href="/beli-mobil"
                        className="block px-4 py-2 text-sm font-medium  text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                      >
                        Mobil Bekas
                      </Link>
                      <Link
                        href="/simulasi-budget"
                        className="block px-4 py-2 text-sm font-medium  text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                      >
                        Simulasi Budget
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/jual-mobil"
                className={`text-sm font-medium hover:text-orange-600 ${
                  pathname === "/jual-mobil"
                    ? "text-orange-600"
                    : "text-gray-700"
                }`}
              >
                Jual Mobil
              </Link>
              <Link
                href="/tukar-tambah"
                className={`text-sm font-medium hover:text-orange-600 relative ${
                  pathname === "/tukar-tambah"
                    ? "text-orange-600"
                    : "text-gray-700"
                }`}
              >
                Tukar Tambah
              </Link>
            </div>
            <div className="hidden md:block border-l border-gray-400 h-7 mx-4" />
            <div className="flex items-center space-x-4">
              <FiSearch
                className="w-5 h-5 text-gray-600 hover:text-orange-600 cursor-pointer"
                onClick={toggleSearch}
              />
              <button className="relative flex items-center space-x-2 rounded-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200">
                <MdPersonOutline className="w-5 h-5 text-gray-700" />
                <HiMenuAlt3 className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <SearchBar />

      <div className="fixed bottom-0 left-0 right-0 w-full z-40 md:hidden h-[70px]">
        <svg
          viewBox={`0 0 300 ${navHeight}`}
          width="100%"
          height={navHeight}
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full h-full drop-shadow-[0_-2px_5px_rgba(0,0,0,0.1)]"
        >
          <path d={svgPath} fill="white" />
        </svg>

        <div className="relative flex items-center justify-between w-full h-full px-4 z-10">
          {/* Item Kiri */}
          <div className="flex items-center gap-6 text-[10px] justify-start">
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <FaHome className="w-5 h-5 text-gray-700" />
              <p className="text-gray-700">Beranda</p>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <FaShoppingBag className="w-5 h-5 text-gray-700" />
              <p className="text-gray-700">Beli Mobil</p>
            </div>
          </div>

          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-orange-500 p-3 rounded-full z-20">
            <FaMoneyBillWaveAlt className="w-8 h-8 text-gray-100" />
          </div>

          {/* Item Kanan */}
          <div className="flex items-center gap-4 text-[10px] justify-end">
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <FaKey className="w-5 h-5 text-gray-700" />
              <p className="text-gray-700">Jual Mobil</p>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <FaArrowsRotate className="w-5 h-5 text-gray-700" />
              <p className="text-gray-700">Tukar Tambah</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-0"></div>
    </>
  );
}

export default AppHeader;
