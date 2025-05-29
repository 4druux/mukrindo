// layout/user/AppHeader.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MdAccountCircle,
  MdLogout,
  MdLogin,
  MdAppRegistration,
} from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { FaHome, FaShoppingBag, FaKey } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { FaArrowsRotate } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/layout/user/SearchBar";
import { useHeader } from "@/context/HeaderContext";
import { useProducts } from "@/context/ProductContext";
import { useAuth } from "@/context/AuthContext";
import { Heart, User } from "lucide-react";

function AppHeader() {
  const { toggleSearch, toggleBookmarkSidebar } = useHeader();
  const { bookmarkCount } = useProducts();
  const { user, logout, isAuthenticated } = useAuth();

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

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-colors duration-300 ${
          isTop ? "bg-gray-50" : "shadow-md bg-white"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-3 py-3 lg:py-5">
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

            <div className="block md:hidden border-l border-gray-300 h-6 mx-2" />

            <div className="flex items-center space-x-2 bg-gray-100 px-2 py-1 lg:px-3 rounded-full border border-gray-300">
              <button
                onClick={toggleBookmarkSidebar}
                className="relative group focus:outline-none p-1"
                aria-label={`Lihat ${bookmarkCount} item tersimpan`}
              >
                <Heart className="w-5 h-5 text-gray-700 hover:text-red-500 hover:fill-red-500 cursor-pointer" />
                {bookmarkCount > -1 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] text-white bg-red-500 rounded-full group-hover:animate-bounce">
                    {bookmarkCount}
                  </span>
                )}
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center rounded-full focus:outline-none"
                  aria-label="User menu"
                >
                  {isAuthenticated && user?.firstName ? (
                    <div
                      title={user.firstName}
                      className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-semibold cursor-pointer hover:bg-orange-600 transition-colors"
                    >
                      {user.firstName.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <User
                      title="Masuk atau Daftar"
                      className={`w-6 h-6 text-gray-700 hover:fill-gray-700 cursor-pointer transition-colors ${
                        isDropdownOpen ? "fill-gray-700 text-gray-700" : ""
                      }`}
                    />
                  )}
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={dropDownVariant}
                      className={`absolute right-0 md:-right-2 mt-2.5 min-w-[200px] rounded-lg border border-gray-200 shadow-lg z-20 ${
                        isTop ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <div className="py-1">
                        {isAuthenticated && user ? (
                          <>
                            <div className="px-4 py-2.5 text-xs text-gray-800 border-b border-gray-200">
                              Halo!{" "}
                              <span className="font-semibold">
                                {user.firstName}
                              </span>
                            </div>
                            <ul className="flex flex-col gap-0 px-1 py-1">
                              <li>
                                <Link
                                  href="/profile"
                                  className="flex items-center gap-2.5 w-full text-left text-xs font-medium px-4 py-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 cursor-pointer transition-colors rounded-md"
                                  onClick={() => setIsDropdownOpen(false)}
                                >
                                  <MdAccountCircle className="w-5 h-5" />
                                  Profil Saya
                                </Link>
                              </li>

                              <li>
                                <button
                                  onClick={handleLogout}
                                  className="flex items-center gap-2.5 w-full text-left text-xs font-medium px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors rounded-md"
                                >
                                  <MdLogout className="w-5 h-5" />
                                  Keluar
                                </button>
                              </li>
                            </ul>
                          </>
                        ) : (
                          <>
                            <ul className="flex flex-col gap-0 px-1 py-1">
                              <li>
                                <Link
                                  href="/login"
                                  className="flex items-center gap-2.5 w-full text-left text-xs font-medium px-4 py-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 cursor-pointer transition-colors"
                                  onClick={() => setIsDropdownOpen(false)}
                                >
                                  <MdLogin className="w-4 h-4" />
                                  Masuk
                                </Link>
                              </li>
                              <li>
                                <Link
                                  href="/register"
                                  className="flex items-center gap-2.5 w-full text-left text-xs font-medium px-4 py-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 cursor-pointer transition-colors"
                                  onClick={() => setIsDropdownOpen(false)}
                                >
                                  <MdAppRegistration className="w-4 h-4" />
                                  Daftar
                                </Link>
                              </li>
                            </ul>
                          </>
                        )}
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

      {/* Mobile */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] p-4 
          flex items-center justify-around md:hidden rounded-t-3xl"
      >
        <Link
          href="/"
          className="flex flex-col items-center gap-1 cursor-pointer text-xs"
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
          className="flex flex-col items-center gap-1 cursor-pointer text-xs"
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
        <Link
          href="/jual-mobil"
          className="flex flex-col items-center gap-1 cursor-pointer text-xs"
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
          className="flex flex-col items-center gap-1 cursor-pointer text-xs"
        >
          <FaArrowsRotate
            className={`w-5 h-5 ${
              pathname === "/tukar-tambah" ? "text-orange-600" : "text-gray-700"
            }`}
          />
          <p
            className={`${
              pathname === "/tukar-tambah" ? "text-orange-600" : "text-gray-700"
            } font-medium`}
          >
            Tukar Tambah
          </p>
        </Link>
      </div>
      <div className="md:pb-0"></div>
    </>
  );
}

export default AppHeader;
