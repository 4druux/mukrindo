// components/Header.js
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MdSearch,
  MdFavoriteBorder,
  MdMenu,
  MdPersonOutline,
  MdKeyboardArrowDown,
} from "react-icons/md";

function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State untuk mobile menu

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto py-5 flex items-center justify-between flex-wrap">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center">
            <Image
              src="/images/logo/logo.svg"
              alt="Caroline.id Logo"
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
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          </div>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-6">
          <div className="relative group">
            <button className="text-sm font-medium text-gray-700 hover:text-blue-600 flex items-center">
              Beli Mobil
              <MdKeyboardArrowDown className="inline-block ml-1 text-gray-700 group-hover:text-blue-600" />
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block bg-white shadow-md rounded-md py-2 mt-1 z-10">
              <Link
                href="/beli-mobil/baru"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Mobil Bekas
              </Link>
              <Link
                href="/beli-mobil/bekas"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Simulasi Budget
              </Link>
            </div>
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
            <span className="absolute top-[-8px] right-[-20px] bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
              Baru
            </span>
          </Link>
        </nav>

        {/* Icons (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          <MdFavoriteBorder className="text-2xl text-gray-700 hover:text-blue-600 cursor-pointer" />
          <span className="relative">
            <MdPersonOutline className="text-2xl text-gray-700 hover:text-blue-600 cursor-pointer" />
            <span className="absolute top-[-8px] right-[-8px] bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              0
            </span>
          </span>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 hover:text-blue-600"
          >
            <MdMenu className="text-3xl" />
          </button>
        </div>

        {/* Mobile Menu (Hidden on Desktop) */}
        {isMenuOpen && (
          <div className="md:hidden w-full mt-2">
            {/* Search Bar (Mobile) */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Jual Mobil"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            </div>

            {/* Navigation Links (Mobile) */}
            <nav className="flex flex-col space-y-2">
              <Link
                href="/beli-mobil"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Beli Mobil
              </Link>
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
                <span className="absolute top-[-8px] right-[-20px] bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                  Baru
                </span>
              </Link>
              <Link
                href="/cabang"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Cabang
              </Link>
              <MdFavoriteBorder className="text-2xl text-gray-700 hover:text-blue-600 cursor-pointer" />
              <span className="relative">
                <MdPersonOutline className="text-2xl text-gray-700 hover:text-blue-600 cursor-pointer" />
                <span className="absolute top-[-8px] right-[-8px] bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  0
                </span>
              </span>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default AppHeader;
