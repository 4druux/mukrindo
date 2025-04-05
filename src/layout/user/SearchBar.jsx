// layout/user/SearchBar.jsx
import  { useEffect } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useHeader } from "@/context/HeaderContext";
import { useRouter } from "next/navigation";
import AnimatedPlaceholder from "@/components/common/AnimatedPlaceholder";
import SearchModal from "@/components/hedaer-user/SearchModal";

const SearchBar = () => {
  const { isSearchOpen, searchQuery, setSearchQuery, toggleSearch } =
    useHeader();
  const router = useRouter(); // 2. Initialize useRouter

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

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // Hanya navigasi jika ada query
      // Encode query untuk URL safety
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      // Arahkan ke halaman /beli dengan query search
      router.push(`/beli?search=${encodedQuery}`);
      toggleSearch(); // Tutup search bar/modal setelah navigasi
    }
    // Opsional: Jika query kosong, mungkin tidak melakukan apa-apa atau
    // arahkan ke /beli tanpa query: router.push('/beli'); toggleSearch();
  };

  // 4. Fungsi untuk menangani penekanan tombol Enter di input
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Mencegah default behavior (misal form submit jika ada)
      handleSearchSubmit(); // Panggil fungsi submit
    }
  };

  const handleClearSearch = () => setSearchQuery("");

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/20 z-[50]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={toggleSearch}
          />
          <motion.div
            className="fixed inset-x-0 top-16 md:top-20 z-[51]"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={toggleSearch}
          >
            <div className="flex flex-col items-center justify-center px-3 lg:px-0">
              <div
                className="border bg-white border-gray-400 px-5 py-2 my-4 rounded-full shadow-lg w-full sm:w-1/2 h-10 flex items-center"
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
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchBar;
