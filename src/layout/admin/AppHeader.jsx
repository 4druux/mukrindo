"use client";

import { useSidebar } from "@/context/SidebarContext";
import NotificationDropdown from "@/components/header-admin/NotificationDropdown";
import UserDropdown from "@/components/header-admin/UserDropdown";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { AlignLeft, Ellipsis, Search } from "lucide-react";
import AnimatedPlaceholder from "@/components/common/AnimatedPlacehoder";

const AppHeader = () => {
  const { toggleSidebar, isMobileOpen, toggleMobileSidebar } = useSidebar();
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef(null);

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

  const placeholderTexts = [
    "Cari berdasarkan No Polisi...",
    "Cari berdasarkan Merek...",
    "Cari berdasarkan Model...",
    "Cari berdasarkan Tahun...",
    "Cari berdasarkan Harga...",
  ];

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="items-center justify-center border-gray-200 rounded-lg z-99999 w-10 h-10 lg:flex lg:h-11 lg:w-11 lg:border cursor-pointer"
            onClick={handleMainToggle}
            aria-label="Toggle Sidebar"
          >
            <AlignLeft className="w-5 h-5 text-gray-500" />
          </button>

          {/* Logo (tampilan mobile) */}
          <Link href="/" className="lg:hidden">
            <Image
              width={154}
              height={32}
              className=""
              src="./images/logo/logo.svg"
              alt="Mukrindo"
            />
          </Link>

          {/* Tombol Menu Aplikasi (tampilan mobile) */}
          <button
            onClick={handleApplicationToggle}
            className="flex items-center justify-center rounded-lg z-50 hover:bg-gray-100 lg:hidden"
          >
            <Ellipsis className="w-5 h-5 text-gray-500" />
          </button>

          {/* Form Pencarian (tampilan desktop) */}
          <div className="hidden lg:block">
            <form>
              <div className="relative overflow-hidden">
                <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                  <Search className="w-5 text-gray-500" />
                </span>
                {searchQuery === "" && (
                  <AnimatedPlaceholder
                    placeholderTexts={placeholderTexts}
                    className="pl-13"
                  />
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder=""
                  className="relative z-50 h-11 w-full rounded-full border-2 border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 focus:outline-hidden focus:border-gray-400 xl:w-[430px]"
                />
                <button className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-full border border-gray-200 bg-gray-100 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500">
                  <span> ⌘ </span>
                  <span> K </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-5 py-4 lg:flex lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            <NotificationDropdown />
          </div>
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
