// layout/user/SearchBar.jsx
import { useEffect } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useHeader } from "@/context/HeaderContext";
import { useRouter } from "next/navigation";
import AnimatedPlaceholder from "@/components/common/AnimatedPlaceholder";
import SearchModal from "@/components/hedaer-user/SearchModal";

const SearchBar = () => {
  const { isSearchOpen, searchQuery, setSearchQuery, toggleSearch } =
    useHeader();
  const router = useRouter();

  const placeholderTexts = [
    "Beli mobil bekas terbaru",
    "Jual mobil saya",
    "Tukar tambah mobil",
  ];

  useEffect(() => {
    document.body.style.overflow = isSearchOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSearchOpen]);

  const containerVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  const mobileContainerVariants = {
    hidden: { opacity: 0, y: "100%" },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: "100%",
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      router.push(`/beli?search=${encodedQuery}`);
      toggleSearch();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleClearSearch = () => setSearchQuery("");

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Mobile View */}
          <motion.div
            key="mobile-search"
            className="fixed inset-0 bg-white z-[51] flex flex-col lg:hidden"
            variants={mobileContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Mobile Search Header */}
            <div className="flex items-center space-x-3 p-4 border-b border-gray-200 flex-shrink-0">
              <div
                className="border bg-white border-gray-400 px-3 py-1 rounded-full w-full flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative flex-1 overflow-hidden">
                  {searchQuery === "" && (
                    <AnimatedPlaceholder placeholderTexts={placeholderTexts} />
                  )}
                  <input
                    value={searchQuery}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="relative z-10 w-full h-full outline-none bg-transparent text-base scale-90 origin-left"
                    type="text"
                    placeholder=""
                  />
                </div>
                {searchQuery && (
                  <button
                    className="hover:bg-gray-100 rounded-full p-1 mr-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearSearch();
                    }}
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
                <div
                  className="border-l-2 border-gray-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Search className="h-4 w-4 ml-2 text-gray-500 cursor-pointer" />
                </div>
              </div>
              <button
                onClick={toggleSearch}
                className="text-sm font-medium text-gray-700 hover:text-orange-600 flex-shrink-0"
              >
                Batalkan
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <SearchModal />
            </div>
          </motion.div>

          {/* Dekstop View */}
          <div className="hidden lg:block">
            <motion.div
              className="fixed inset-0 bg-black/50 z-[50]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={toggleSearch}
            />

            <motion.div
              className="absolute right-0 top-20 z-[51]"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={toggleSearch}
            >
              <div className="flex flex-col items-center justify-center">
                <div
                  className="border bg-white border-gray-400 px-5 py-2 my-2 rounded-full w-1/2 shadow-lg h-10 flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative flex-1 overflow-hidden">
                    {searchQuery === "" && (
                      <AnimatedPlaceholder
                        placeholderTexts={placeholderTexts}
                      />
                    )}
                    <input
                      value={searchQuery}
                      onKeyDown={handleKeyDown}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="relative z-10 w-full h-full outline-none bg-transparent text-sm"
                      type="text"
                      placeholder=""
                      autoFocus
                    />
                  </div>
                  {searchQuery && (
                    <button
                      className="hover:bg-gray-100 rounded-full p-1 mr-1 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearSearch();
                      }}
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                  <div
                    className="border-l-2 border-gray-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Search className="h-4 w-4 ml-2 text-gray-500 cursor-pointer" />
                  </div>
                </div>
                <SearchModal />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchBar;
