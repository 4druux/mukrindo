// components/Header.js
"use client";

import React, { useState, useEffect, useRef } from "react";
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

  const notchedBackgroundSvg =
    "data:image/svg+xml,%3Csvg width='300' height='70' viewBox='0 0 300 70' fill='none' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'%3E%3Cpath d='M0 70 L0 20 A 20 20 0 0 1 20 0 L122 0 A 20 20 0 0 0 178 0 L280 0 A 20 20 0 0 1 300 20 L300 70 Z' fill='white'/%3E%3C/svg%3E";

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-colors duration-300 ${
          isTop ? "bg-gray-50" : "shadow-md bg-white"
        }`}
      >
        <div className="flex items-center justify-between px-2 sm:px-[6vw] md:px-[9vw] lg:px-[10vw] py-3 lg:py-6">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center">
              {/* <Image
                src="/images/logo/logo.svg"
                alt="MukrindoLogo"
                width={130}
                height={35}
                className="cursor-pointer lg:w-[150px] lg:h-[40px]"
              /> */}
              Mukrindo Motor LOGO
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

      <div
        className="fixed -bottom-0.5 left-0 right-0 w-full z-40 md:hidden h-[70px] bg-transparent"
        style={{
          backgroundImage: `url("${notchedBackgroundSvg}")`,
          backgroundSize: "cover",
          // backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
          filter: "drop-shadow(0 -2px 5px rgba(0,0,0,0.1))",
        }}
      >
        <div className="relative flex items-center justify-between w-full h-full px-4">
          {/* Left Icons */}
          <div className="flex items-center gap-6 text-[10px] z-10">
            <Link
              href="/"
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <FaHome
                className={`w-5 h-5 ${
                  pathname === "/" ? "text-orange-600" : "text-gray-700"
                }`}
              />
              <p
                className={`${
                  pathname === "/" ? "text-orange-600" : "text-gray-700"
                } font-medium`}
              >
                Beranda
              </p>
            </Link>
            <Link
              href="/beli-mobil"
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <FaShoppingBag
                className={`w-5 h-5 ${
                  pathname === "/beli-mobil"
                    ? "text-orange-600"
                    : "text-gray-700"
                }`}
              />
              <p
                className={`${
                  pathname === "/beli-mobil"
                    ? "text-orange-600"
                    : "text-gray-700"
                } font-medium`}
              >
                Beli Mobil
              </p>
            </Link>
          </div>

          <Link
            href="/simulasi-budget"
            className="absolute left-1/2 transform -translate-x-1/2 -top-8 w-16 h-16 bg-orange-500 rounded-full z-20 flex items-center justify-center shadow-lg cursor-pointer"
          >
            <FaMoneyBillWaveAlt className="w-8 h-8 text-gray-100" />
          </Link>

          {/* Right Icons */}
          <div className="flex items-center gap-4 text-[10px] z-10">
            <Link
              href="/jual-mobil"
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <FaKey
                className={`w-5 h-5 ${
                  pathname === "/jual-mobil"
                    ? "text-orange-600"
                    : "text-gray-700"
                }`}
              />
              <p
                className={`${
                  pathname === "/jual-mobil"
                    ? "text-orange-600"
                    : "text-gray-700"
                } font-medium`}
              >
                Jual Mobil
              </p>
            </Link>
            <Link
              href="/tukar-tambah"
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <FaArrowsRotate
                className={`w-5 h-5 ${
                  pathname === "/tukar-tambah"
                    ? "text-orange-600"
                    : "text-gray-700"
                }`}
              />
              <p
                className={`${
                  pathname === "/tukar-tambah"
                    ? "text-orange-600"
                    : "text-gray-700"
                } font-medium`}
              >
                Tukar Tambah
              </p>
            </Link>
          </div>
        </div>
      </div>

      <div className="pb-0"></div>
    </>
  );
}

export default AppHeader;
