"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Import Icons
import { ChevronDown, CircleUser, LogOut, Settings2 } from "lucide-react";

export default function UserDropdown() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center text-gray-700 dropdown-toggle cursor-pointer"
      >
        <span className="mr-1 lg:mr-3 overflow-hidden rounded-full border border-gray-200 w-8 lg:w-11">
          <Image
            width={44}
            height={44}
            src="/images/carousel/7.jpg"
            alt="User"
          />
        </span>
        <span className="mr-1 font-medium text-sm hidden lg:block">
          Mukrindo
        </span>
        <div
          className={`transition-transform duration-200 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </button>

      {/* Inlined Dropdown */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={dropDownVariant}
            className="absolute z-40 right-0 mt-2 rounded-2xl border border-gray-200 bg-white shadow-lg p-4"
          >
            <div>
              <span className="block font-medium text-gray-700 text-sm">
                Mukrindo
              </span>
              <span className="mt-0.5 block text-theme-xs text-gray-500">
                mukrindo@pimjo.com
              </span>
            </div>
            <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200">
              <li>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 group"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <CircleUser className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                  Edit profile
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 group"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <Settings2 className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                  Account settings
                </Link>
              </li>
            </ul>
            {/* Inlined DropdownItem (Link) */}
            <Link
              href="/signin"
              className="flex items-center gap-3 px-3 py-2 mt-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 group"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <LogOut className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transform rotate-180" />
              Sign out
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
