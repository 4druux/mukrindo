// components/header-admin/AppHeader.jsx
"use client";
import { useSidebar } from "@/context/SidebarContext";
import NotificationDropdown from "@/components/header-admin/NotificationDropdown";
import UserDropdown from "@/components/header-admin/UserDropdown";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { AlignLeft, Ellipsis, Search, X } from "lucide-react";
import AnimatedPlaceholder from "@/components/common/AnimatedPlaceholder";
import { useRouter } from "next/navigation";

const AppHeader = () => {
  const {
    toggleSidebar,
    isMobileOpen,
    toggleMobileSidebar,
    searchQuery,
    setSearchQuery,
  } = useSidebar();
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);
  const router = useRouter();

  const closeApplicationMenu = () => {
    setApplicationMenuOpen(false);
  };

  const handleMainToggle = () => {
    if (window.innerWidth >= 991) {
      toggleSidebar();
      closeApplicationMenu();
    } else {
      toggleMobileSidebar();
      closeApplicationMenu();
    }
  };

  const handleApplicationToggle = () => {
    setApplicationMenuOpen((prev) => !prev);
    if (isMobileOpen) {
      toggleMobileSidebar();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchQuery(inputValue);
    router.push(`/admin?search=${inputValue}`, undefined, {
      shallow: true,
    });
  };

  const handleResetSearch = () => {
    setInputValue("");
    setSearchQuery("");
    router.push(`/admin`, undefined, {
      shallow: true,
    });
    inputRef.current?.focus();
  };

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const placeholderTexts = [
    "Cari berdasarkan No Polisi...",
    "Cari berdasarkan Merek...",
    "Cari berdasarkan Model...",
    "Cari berdasarkan Tahun...",
    "Cari berdasarkan Harga...",
  ];

  return (
    <header className="sticky -top-1 lg:top-0 w-full bg-white border-gray-200 z-40 border-b">
      <div className="flex items-center justify-between">
        <button
          className="items-center ml-4 justify-center border-gray-200 rounded-lg z-50 w-11 h-11 lg:flex lg:border cursor-pointer"
          onClick={handleMainToggle}
          aria-label="Toggle Sidebar"
        >
          <AlignLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex items-center bg-white justify-end w-full gap-4 px-4 py-4 lg:flex lg:justify-end lg:px-4 lg:shadow-none">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="block">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative overflow-hidden">
                  <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                    <Search className="w-5 text-gray-500" />
                  </span>
                  {inputValue === "" && (
                    <AnimatedPlaceholder
                      placeholderTexts={placeholderTexts}
                      className="pl-13"
                    />
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder=""
                    className="relative z-50 h-11 w-full rounded-full border-2 border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 focus:outline-hidden focus:border-gray-400 xl:w-[430px]"
                  />

                  {inputValue && (
                    <button
                      type="button"
                      onClick={handleResetSearch}
                      className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 z-50"
                      aria-label="Reset Search"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                  <div className="hidden lg:block ">
                    <div className="absolute right-13 top-1/2 -translate-y-1/2 border-l h-6 border-gray-300" />
                    <button
                      type="submit"
                      className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-full border border-gray-200 bg-gray-100 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500"
                    >
                      <span> ⌘ </span>
                      <span> K </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <NotificationDropdown />
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
