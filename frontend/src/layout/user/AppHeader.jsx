// layout/user/AppHeader.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdPersonOutline } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import {
  FaHome,
  FaShoppingBag,
  FaKey,
  FaMoneyBillWaveAlt,
} from "react-icons/fa";
import { usePathname } from "next/navigation";
import { FaArrowsRotate } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/layout/user/SearchBar";
import { useHeader } from "@/context/HeaderContext";
import { useProducts } from "@/context/ProductContext";
import { Heart } from "lucide-react";

function AppHeader() {
  const { isSearchOpen, toggleSearch, toggleBookmarkSidebar } = useHeader();
  const { bookmarkCount } = useProducts();
  const [isTop, setIsTop] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

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
        <div className="container mx-auto flex items-center justify-between px-3 py-3 lg:py-5">
          {/* Logo */}
          <Link href="/">
            <div className="">
              <Image
                src="/images/logo/mm-logo-header.png"
                alt="MukrindoLogo"
                width={180}
                height={20}
                priority={true}
                className="cursor-pointer w-[150px] md:w-[200px]"
              />
            </div>
          </Link>

          <div className="flex items-center justify-end">
            <div className="hidden md:flex items-center md:space-x-4 lg:space-x-6">
              <Link
                href="/"
                className={`text-sm font-medium hover:text-orange-500 ${
                  pathname === "/" ? "text-orange-600" : "text-gray-700"
                }`}
              >
                Beranda
              </Link>
              <Link
                href="/beli"
                className={`text-sm font-medium hover:text-orange-500 ${
                  pathname === "/beli" ? "text-orange-600" : "text-gray-700"
                }`}
              >
                Beli Mobil
              </Link>

              <Link
                href="/jual-mobil"
                className={`text-sm font-medium hover:text-orange-500 ${
                  pathname === "/jual-mobil"
                    ? "text-orange-600"
                    : "text-gray-700"
                }`}
              >
                Jual Mobil
              </Link>

              <Link
                href="/tukar-tambah"
                className={`text-sm font-medium hover:text-orange-500 relative ${
                  pathname === "/tukar-tambah"
                    ? "text-orange-600"
                    : "text-gray-700"
                }`}
              >
                Tukar Tambah
              </Link>
            </div>

            <div className="hidden md:block border-l border-gray-400 h-7 mx-4" />

            <FiSearch
              className="w-5 h-5 text-gray-600 cursor-pointer mx-0 md:mr-4"
              onClick={toggleSearch}
            />

            <div className="block md:hidden border-l border-gray-400 h-7 mx-4" />

            <div className="flex items-center space-x-3 md:space-x-4 bg-gray-100 px-2 lg:px-4 rounded-full border border-gray-300">
              <button
                onClick={toggleBookmarkSidebar}
                className="relative group focus:outline-none"
                aria-label={`Lihat ${bookmarkCount} item tersimpan`}
              >
                <Heart className="w-4 h-4 lg:w-5 lg:h-5 text-gray-700 cursor-pointer" />
                {bookmarkCount > -1 && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center w-2 h-2 p-1.5 text-[10px] text-white bg-red-500 rounded-full group-hover:animate-bounce transition-all duration-300 ease-in-out">
                    {bookmarkCount}
                  </span>
                )}
              </button>

              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <MdPersonOutline className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700 cursor-pointer mt-1.5" />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={dropDownVariant}
                      className={`absolute -right-2 md:-right-3 mt-2 min-w-[120px] rounded-xl border border-gray-200 shadow-lg z-20 ${
                        isTop ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <div className="py-1">
                        <Link
                          href="/login"
                          className="block w-full text-left text-xs font-medium px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          Masuk
                        </Link>
                        <Link
                          href="/register"
                          className="block w-full text-left text-xs font-medium px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          Daftar
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      <SearchBar />

      <div
        className="fixed bottom-0 left-0 right-0 z-30 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] px-4 py-3 rounded-t-3xl
          flex items-center justify-between md:hidden "
      >
        <div className="relative flex items-center gap-3 justify-between text-[10px] w-full">
          {/* Left Icons */}
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
            href="/beli"
            className="flex flex-col items-center gap-1 cursor-pointer"
          >
            <FaShoppingBag
              className={`w-5 h-5 ${
                pathname === "/beli" ? "text-orange-600" : "text-gray-700"
              }`}
            />
            <p
              className={`${
                pathname === "/beli" ? "text-orange-600" : "text-gray-700"
              } font-medium`}
            >
              Beli Mobil
            </p>
          </Link>

          {/* Right Icons */}
          <Link
            href="/jual-mobil"
            className="flex flex-col items-center gap-1 cursor-pointer"
          >
            <FaKey
              className={`w-5 h-5 ${
                pathname === "/jual-mobil" ? "text-orange-600" : "text-gray-700"
              }`}
            />
            <p
              className={`${
                pathname === "/jual-mobil" ? "text-orange-600" : "text-gray-700"
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

      <div className="pb-0"></div>
    </>
  );
}

export default AppHeader;
