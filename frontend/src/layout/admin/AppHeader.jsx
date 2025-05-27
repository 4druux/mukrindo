// layout/admin/AppHeader.jsx
"use client";
import { useSidebar } from "@/context/SidebarContext";
import NotificationDropdown from "@/components/header-admin/NotificationDropdown";
import AdminDropdown from "@/components/header-admin/AdminDropdown";
import { useState, useEffect, useRef } from "react";
import { AlignLeft, Search, X } from "lucide-react";
import AnimatedPlaceholder from "@/components/common/AnimatedPlaceholder";
import { useRouter } from "next/navigation";

const AppHeader = () => {
  const { toggleSidebar, toggleMobileSidebar, searchQuery, setSearchQuery } =
    useSidebar();
  const [inputValue, setInputValue] = useState(searchQuery || "");
  const inputRef = useRef(null);
  const router = useRouter();

  const handleMainToggle = () => {
    if (window.innerWidth >= 1115) {
      toggleSidebar();
    } else {
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

  useEffect(() => {
    if (searchQuery === "") {
      setInputValue("");
    }
  }, [searchQuery]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedQuery = inputValue.trim();

    setSearchQuery(trimmedQuery);

    if (trimmedQuery) {
      router.push(
        `/admin/produk?search=${encodeURIComponent(trimmedQuery)}`,
        undefined,
        {
          shallow: true,
        }
      );
    } else {
      router.push(`/admin/produk`, undefined, {
        shallow: true,
      });
    }
    setInputValue("");
  };

  const handleClearTypedInput = () => {
    setInputValue("");
    inputRef.current?.focus();
  };

  const placeholderTexts = [
    "Cari berdasarkan Merek...",
    "Cari berdasarkan Model...",
    "Cari berdasarkan Tahun...",
    "Cari berdasarkan Harga...",
  ];

  return (
    <header className="sticky -top-1 lg:top-0 w-full bg-white border-gray-200 z-40 shadow-md lg:shadow-none lg:border-b">
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
                  <span className="absolute -translate-y-1/2 left-3 lg:left-4 top-1/2 pointer-events-none">
                    <Search className="w-4 lg:w-5 text-gray-500" />
                  </span>
                  {inputValue === "" && (
                    <AnimatedPlaceholder
                      placeholderTexts={placeholderTexts}
                      className="pl-9 lg:pl-13 max-w-[170px] lg:max-w-full whitespace-nowrap"
                    />
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder=""
                    className="relative z-50 h-8 lg:h-11 w-full rounded-full border-2 border-gray-200 bg-transparent py-2.5 pl-8 lg:pl-12 pr-8 lg:pr-20 text-base xl:text-sm text-gray-800 focus:outline-hidden focus:border-gray-400 xl:w-[430px]"
                  />
                  {inputValue && (
                    <button
                      type="button"
                      onClick={handleClearTypedInput}
                      className="absolute right-2 lg:right-14 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 z-50 cursor-pointer"
                      aria-label="Clear input"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                  <div className="hidden lg:block ">
                    <div className="absolute right-13 top-1/2 -translate-y-1/2 border-l h-6 border-gray-300" />
                    <button
                      type="submit"
                      className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-full border border-gray-200 bg-gray-100 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500"
                      aria-label="Submit Search with Command K"
                    >
                      <span> ⌘ </span>
                      <span> K </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <NotificationDropdown />
            <AdminDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
