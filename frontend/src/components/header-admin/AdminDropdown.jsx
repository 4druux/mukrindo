// frontend/src/components/header-admin/AdminDropdown.jsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

import { MdAccountCircle, MdLogout, MdSettings } from "react-icons/md";
import { ChevronDown } from "lucide-react";

export default function AdminDropdown() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout, isAuthenticated } = useAuth();

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
    logout();
    setIsDropdownOpen(false);
  };

  const renderTriggerContent = () => {
    if (isAuthenticated && user) {
      return (
        <>
          {user.avatar ? (
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full overflow-hidden relative border border-gray-200">
              <Image
                src={user.avatar}
                alt={user.firstName || "Admin Avatar"}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 32px, 36px"
                priority
              />
            </div>
          ) : (
            <div
              title={user.firstName || "Admin"}
              className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center text-xs font-semibold select-none cursor-pointer transition-colors"
            >
              {user.firstName.charAt(0).toUpperCase()}
              {user.lastName ? user.lastName.charAt(0).toUpperCase() : ""}
            </div>
          )}
          <span className="ml-2 mr-1 font-medium text-sm hidden lg:block text-gray-700">
            {user.firstName.charAt(0).toUpperCase()}
            {user.lastName ? user.lastName.charAt(0).toUpperCase() : ""}
          </span>
        </>
      );
    }
    return (
      <>
        <span className="overflow-hidden rounded-full border border-gray-200 w-8 lg:w-11">
          <Image
            width={44}
            height={44}
            src="/images/placeholder-avatar.png"
            alt="User"
            priority
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
            className="absolute z-50 right-0 mt-2.5 w-64 rounded-lg border border-gray-200 bg-white shadow-xl"
          >
            <div className="py-1">
              {isAuthenticated && user ? (
                <>
                  <div className="px-4 py-2.5 text-xs text-gray-800 border-b border-gray-200">
                    Halo,{" "}
                    <span className="font-semibold">
                      {user.firstName} {user.lastName}!
                    </span>
                  </div>

                  <ul className="flex flex-col gap-0 px-1 py-1">
                    <li>
                      <Link
                        href="/admin/profile"
                        className="flex items-center gap-2.5 w-full text-left text-xs font-medium px-4 py-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 cursor-pointer transition-colors rounded-md"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <MdAccountCircle className="w-5 h-5" />
                        Edit Profil
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="/admin/settings"
                        className="flex items-center gap-2.5 w-full text-left text-xs font-medium px-4 py-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 cursor-pointer transition-colors rounded-md"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <MdSettings className="w-5 h-5" />
                        Pengaturan
                      </Link>
                    </li>
                  </ul>

                  <div className="px-1 py-1 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full text-left text-xs font-medium px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors rounded-md"
                    >
                      <MdLogout className="w-4 h-4" /> Keluar
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2.5 w-full text-left text-xs font-medium px-4 py-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 cursor-pointer transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <MdLogout className="w-4 h-4" />
                  Masuk
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
