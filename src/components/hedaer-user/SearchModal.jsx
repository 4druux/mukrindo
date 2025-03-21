// components/SearchModal.js
import React from "react";
import { motion } from "framer-motion";

const SearchModal = () => {
  const modalVariants = {
    hidden: { opacity: 0, y: 20, transition: { duration: 0.2 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-4 w-full sm:w-1/2 mx-auto"
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4">
        <h3 className="text-md font-medium">Pencarian Teratas</h3>
        <div className="flex flex-wrap gap-2 mt-2 cursor-pointer">
          {/* Contoh item pencarian teratas */}
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
            Toyota Avanza
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
            Toyota Innova
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
            Daihatsu Ayla
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
            Toyota Calya
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
            Daihatsu Sigra
          </span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-md font-medium">Pilihan Cepat</h3>
        <div className="flex flex-wrap gap-2 mt-2 cursor-pointer">
          {/* Contoh item pilihan cepat */}
          <button className="px-3 py-1 rounded-full bg-orange-500 text-white text-sm">
            Mobil Rekomendasi
          </button>
          <button className="px-3 py-1 rounded-full bg-orange-500 text-white text-sm">
            Kilometer Terendah
          </button>
          <button className="px-3 py-1 rounded-full bg-orange-500 text-white text-sm">
            Harga Terendah
          </button>
          <button className="px-3 py-1 rounded-full bg-orange-500 text-white text-sm">
            Tahun Terbaru
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium">Merek Populer</h3>
        <div className="flex flex-wrap gap-2 mt-2 cursor-pointer">
          {/* Contoh item merek populer */}
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
            Toyota
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
            Daihatsu
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
            Honda
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
            Mitsubishi
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
            Suzuki
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
            Nissan
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchModal;
