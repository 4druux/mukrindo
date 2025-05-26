// frontend/src/components/header-admin/AdminDropdown.jsx
"use client";
import Link from "next/link";
import Image from "next/image"; // Tetap impor jika ada fallback image
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext"; // 1. Impor useAuth

// Import Icons
import { ChevronDown, CircleUser, LogOut, Settings2 } from "lucide-react";

export default function AdminDropdown() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout, isAuthenticated } = useAuth(); // 2. Dapatkan data dari AuthContext

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

  const handleLogout = () => {
    logout(); // Panggil fungsi logout dari context
    setIsDropdownOpen(false); // Tutup dropdown
  };

  // Menentukan apa yang ditampilkan sebagai trigger dropdown (inisial atau ikon default)
  const renderTriggerContent = () => {
    if (isAuthenticated && user) {
      return (
        <>
          <div
            title={user.firstName || "Admin"}
            className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-semibold select-none cursor-pointer hover:bg-indigo-700 transition-colors"
          >
            {/* Tampilkan inisial nama depan, fallback ke 'A' jika tidak ada */}
            {user.firstName ? user.firstName.charAt(0).toUpperCase() : "A"}
          </div>
          <span className="ml-2 mr-1 font-medium text-sm hidden lg:block text-gray-700">
            {user.firstName || "Admin"}
          </span>
        </>
      );
    }
    // Fallback jika tidak terautentikasi (seharusnya tidak terjadi di panel admin yang terproteksi)
    return (
      <>
        <span className="overflow-hidden rounded-full border border-gray-200 w-8 lg:w-11">
          <Image
            width={44}
            height={44}
            src="/images/placeholder-avatar.png" // Ganti dengan placeholder avatar generik
            alt="User"
          />
        </span>
        <span className="mr-1 font-medium text-sm hidden lg:block text-gray-700">
          Admin
        </span>
      </>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center text-gray-700 dropdown-toggle cursor-pointer focus:outline-none"
        aria-label="Admin menu"
      >
        {renderTriggerContent()}
        <div
          className={`transition-transform duration-200 ml-1 ${
            // Tambah ml-1 untuk jarak
            isDropdownOpen ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={dropDownVariant}
            className="absolute z-50 right-0 mt-2.5 w-64 rounded-lg border border-gray-200 bg-white shadow-xl" // Disesuaikan shadow dan width
          >
            <div className="p-3 border-b border-gray-200">
              {" "}
              {/* Disesuaikan padding */}
              {isAuthenticated && user ? (
                <>
                  <span className="block font-semibold text-gray-800 text-sm">
                    {user.firstName || "Nama Admin"} {user.lastName || ""}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-500">
                    {user.email || "admin@example.com"}
                  </span>
                </>
              ) : (
                <>
                  <span className="block font-medium text-gray-700 text-sm">
                    Admin
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-500">
                    admin@example.com
                  </span>
                </>
              )}
            </div>
            <ul className="flex flex-col gap-0.5 p-2">
              {" "}
              {/* Disesuaikan padding dan gap */}
              <li>
                <Link
                  href="/admin/profile" // Arahkan ke profil admin
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 group"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <CircleUser className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                  Edit Profil
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/settings" // Arahkan ke pengaturan admin
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 group"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings2 className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                  Pengaturan
                </Link>
              </li>
            </ul>
            <div className="p-2 border-t border-gray-200">
              {" "}
              {/* Disesuaikan padding */}
              <button // 3. Ubah Link Logout menjadi button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-red-600 rounded-md hover:bg-red-50 group"
              >
                <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600 transform rotate-180" />
                Keluar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
