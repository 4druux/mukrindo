// components/Header.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdPersonOutline, MdKeyboardArrowDown } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { HiMenuAlt3 } from "react-icons/hi";
import { FaHome, FaShoppingBag, FaKey, FaExchangeAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/layout/user/SearchBar";
import { useHeader } from "@/context/HeaderContext";

function AppHeader() {
  const { isSearchOpen, toggleSearch } = useHeader();
  const [isTop, setIsTop] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = router.pathname;

  // --- Efek scroll dan klik di luar dropdown (tidak berubah) ---
  useEffect(() => {
    const handleScroll = () => setIsTop(window.scrollY <= 50); // Sedikit toleransi scroll
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Panggil sekali saat mount
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

  const bottomNavItems = [
    { href: "/", label: "Beranda", icon: FaHome },
    { href: "/beli-mobil", label: "Beli Mobil", icon: FaShoppingBag },
    { href: "/jual-mobil", label: "Jual Mobil", icon: FaKey },
    {
      href: "/tukar-tambah",
      label: "Tukar Tambah",
      icon: FaExchangeAlt,
      isNew: true,
    },
  ];

  return (
    <>
      {/* Header Utama (Desktop & Mobile) */}
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
                width={130} // Sedikit lebih kecil untuk mobile
                height={35}
                className="cursor-pointer lg:w-[150px] lg:h-[40px]"
              />
            </div>
          </Link>

          {/* Navigasi Desktop & Ikon Kanan */}
          <div className="flex items-center justify-end">
            {/* Navigasi Teks (Hanya Desktop) */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className={`text-sm font-medium hover:text-orange-600 ${
                  pathname === "/" ? "text-orange-600" : "text-gray-700"
                }`}
              >
                Beranda
              </Link>
              {/* Dropdown Menu Beli Mobil (Desktop) */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`text-sm font-medium hover:text-orange-600 flex items-center gap-1 group ${
                    isDropdownOpen || pathname?.startsWith("/beli-mobil")
                      ? "text-orange-600"
                      : "text-gray-700"
                  }`}
                >
                  Beli Mobil
                  <motion.span>
                    <MdKeyboardArrowDown />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div /* ... (dropdown tidak berubah) ... */>
                      <Link
                        href="/beli-mobil/bekas" /* Ganti path jika perlu */
                      >
                        {" "}
                        Mobil Bekas{" "}
                      </Link>
                      <Link href="/simulasi-budget" /* Ganti path jika perlu */>
                        {" "}
                        Simulasi Budget{" "}
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
                {/* Badge 'Baru' bisa ditambahkan di sini juga jika perlu */}
              </Link>
            </div>
            {/* Pemisah (Hanya Desktop) */}
            <div className="hidden md:block border-l border-gray-400 h-7 mx-4" />{" "}
            {/* <--- hidden md:block */}
            {/* Ikon Kanan (Desktop & Mobile) */}
            <div className="flex items-center space-x-4">
              <FiSearch
                className="w-5 h-5 text-gray-600 hover:text-orange-600 cursor-pointer"
                onClick={toggleSearch}
              />
              {/* Tombol Login/Menu (Contoh) */}
              <button className="relative flex items-center space-x-2 rounded-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200">
                <MdPersonOutline className="w-5 h-5 text-gray-700" />
                <HiMenuAlt3 className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* SearchBar (Tidak berubah) */}
      <SearchBar />
      {/* === Navigasi Bawah (Hanya Mobile) === */}
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex justify-around items-center p-2 z-40 md:hidden">
        {" "}
        {/* <--- flex md:hidden */}
        {bottomNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href}>
              <div
                className={`flex flex-col items-center justify-center gap-0.5 relative ${
                  isActive
                    ? "text-orange-500"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {item.isNew && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                    Baru
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
      {/* Padding bawah untuk konten agar tidak tertutup nav bottom */}
      <div className="pb-0"></div>
    </>
  );
}

export default AppHeader;
