"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Import Icons
import { Bell, X } from "lucide-react";

export default function NotificationDropdown() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
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

  useEffect(() => {
    if (isDropdownOpen) {
      setNotifying(false);
    }
  }, [isDropdownOpen]);

  const dropDownVariant = {
    open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border
         border-gray-200 rounded-full hover:text-gray-700 w-8 h-8 lg:w-11 lg:h-11 hover:bg-gray-100 cursor-pointer"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-300 ${
            !notifying ? "hidden" : ""
          }`}
        >
          <span className="absolute -right-0.5 -top-0.5 z-10 h-3 w-3 bg-orange-500 rounded-full opacity-75 animate-ping"></span>
        </span>
        <Bell className="w-4 lg:w-5" />
      </button>

      {/* Inlined Dropdown */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={dropDownVariant}
            className="absolute right-[-80px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 
          bg-white p-3 shadow-lg sm:w-[361px]"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
              <h5 className="text-lg font-semibold text-gray-800">
                Notification
              </h5>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="transition dropdown-toggle"
              >
                <X className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
              </button>
            </div>
            <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
              <li>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 w-full text-left"
                >
                  <span className="relative block w-full h-10 rounded-full z-1 max-w-10">
                    <Image
                      width={40}
                      height={40}
                      src="/images/user/user-02.jpg"
                      alt="User"
                      className="w-full overflow-hidden rounded-full"
                    />
                    <span
                      className="absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] 
                  border-white bg-success-500"
                    ></span>
                  </span>
                  <span className="block">
                    <span className="mb-1.5 space-x-1 block text-theme-sm text-gray-500">
                      <span className="font-medium text-gray-800">
                        Terry Franci
                      </span>
                      <span>requests permission to change</span>
                      <span className="font-medium text-gray-800">
                        Project - Nganter App
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-gray-500 text-theme-xs">
                      <span>Project</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>5 min ago</span>
                    </span>
                  </span>
                </button>
              </li>
            </ul>
            <Link
              href="/"
              className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 
            bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              View All Notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
