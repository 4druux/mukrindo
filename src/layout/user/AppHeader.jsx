// components/Header.js
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MdSearch,
  MdFavoriteBorder,
  MdPersonOutline,
  MdKeyboardArrowDown,
  MdClose,
} from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { HiMenuAlt3 } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

// Komponen untuk satu item di recent searches
const RecentSearchItem = ({ item, onClick }) => (
  <button
    className="text-neutral-600 rounded-full text-xs font-medium bg-gray-100 hover:bg-blue-50 py-2 w-full cursor-pointer"
    onClick={() => onClick(item)}
  >
    {item}
  </button>
);

// Komponen untuk satu item di quick options
const QuickOptionItem = ({ item, onClick }) => (
  <button
    className="text-xs text-white font-medium bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full cursor-pointer"
    onClick={() => onClick(item)}
  >
    {item}
  </button>
);

// Komponen untuk satu item di popular brands
const BrandItem = ({ brand, onClick }) => (
  <div className="cursor-pointer" onClick={() => onClick(brand)}>
    <Image
      src={`/images/brands/${brand}.svg`} // Asumsikan ada folder images/brands
      alt={brand}
      width={60}
      height={40}
      className="hover:opacity-80 transition-opacity"
    />
  </div>
);

// Komponen utama dropdown pencarian
const SearchDropdown = ({
  isOpen,
  onClose,
  recentSearches,
  quickOptions,
  popularBrands,
  onItemClick,
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, dropdownRef]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 w-full bg-white border border-neutral-200 shadow-lg rounded-3xl z-20"
          style={{
            width: "calc(100% + 1rem)",
            marginLeft: "-0.5rem",
          }}
        >
          <div className="p-4">
            <div className="flex justify-end mb-2">
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <MdClose className="text-xl" />
              </button>
            </div>
            <h3 className="text-lg font-semibold mb-2">Pencarian Teratas</h3>
            <div className="border-b border-neutral-200 pb-4 mb-4 grid grid-cols-5 gap-3">
              {recentSearches.map((item) => (
                <RecentSearchItem
                  key={item}
                  item={item}
                  onClick={onItemClick}
                />
              ))}
            </div>
            <h3 className="text-lg font-semibold mb-2">Pilihan Cepat</h3>
            <div className="flex space-x-2 mb-4 flex-wrap">
              {quickOptions.map((item) => (
                <QuickOptionItem key={item} item={item} onClick={onItemClick} />
              ))}
            </div>
            <h3 className="text-lg font-semibold mb-2">Merek Populer</h3>
            <div className="grid grid-cols-6 gap-4">
              {popularBrands.map((brand) => (
                <BrandItem key={brand} brand={brand} onClick={onItemClick} />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function AppHeader() {
  const [isTop, setIsTop] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Use useMemo here
  const recentSearches = useMemo(
    () => [
      "Toyota Avanza",
      "Toyota Innova",
      "Daihatsu Ayla",
      "Toyota Calya",
      "Daihatsu Sigra",
    ],
    []
  );

  const quickOptions = useMemo(
    () => [
      "Mobil Rekomendasi",
      "Kilometer Terendah",
      "Harga Terendah",
      "Tahun Terbaru",
    ],
    []
  );

  const popularBrands = useMemo(
    () => ["Toyota", "Daihatsu", "Honda", "Mitsubishi", "Suzuki", "Nissan"],
    []
  );

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

  // Use useCallback for event handlers
  const handleSearchClick = useCallback(() => {
    setIsSearchOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  }, []);

  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleSearchItemClick = useCallback((item) => {
    setSearchQuery(item);
    setIsSearchOpen(false);
    console.log("Melakukan pencarian untuk:", item);
  }, []);

  const handleSearchInputChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  // Inline NavbarDesktop logic
  const beliMobilVariants = {
    open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <header
      className={`sticky top-0 z-50 ${
        isTop ? "bg-gray-50" : "shadow-md bg-white"
      }`}
    >
      <div className="flex items-center justify-between px-3 md:px-40 py-3 lg:py-6">
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

        {/* Search Bar, Navigation, and Icons (Right Side) */}
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-6">
            {/* Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`text-md font-medium  hover:text-blue-600 flex items-center gap-1 group ${
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
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={beliMobilVariants}
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
              className="text-md font-medium text-gray-700 hover:text-blue-600"
            >
              Jual Mobil
            </Link>
            <Link
              href="/tukar-tambah"
              className="text-md font-medium text-gray-700 hover:text-blue-600 relative"
            >
              Tukar Tambah
            </Link>
          </div>

          <div className="border-l border-gray-400 h-7 mx-4" />

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {/* <MdFavoriteBorder className="text-2xl cursor-pointer" /> */}
            <FiSearch className="w-6 h-6 text-gray-600 cursor-pointer" />
            <span
              className={`relative flex space-x-2 rounded-full py-2 px-4 ${
                isTop ? "bg-gray-200" : "bg-gray-100"
              }`}
            >
              <MdPersonOutline className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
              <HiMenuAlt3 className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
