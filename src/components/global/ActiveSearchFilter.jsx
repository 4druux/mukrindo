// components/global/ActiveSearchFilters.jsx
import React from "react";
import { FaTrashAlt } from "react-icons/fa";
import { X } from "lucide-react";

/**
 * @param {object} props
 * @param {object} props.splitResult - Hasil pemisahan query: { brand: string|null, modelQuery: string|null, fullQuery: string }
 * @param {function} props.onClearSearch - Callback saat tombol "Hapus Semua" diklik.
 * @param {function} props.onRemoveBrand - Callback saat tombol 'X' pada tag brand diklik.
 * @param {function} props.onRemoveModel - Callback saat tombol 'X' pada tag model/query diklik.
 */

const ActiveSearchFilters = ({
  splitResult,
  onClearSearch,
  onRemoveBrand,
  onRemoveModel,
}) => {
  const { brand, modelQuery, fullQuery } = splitResult;

  // Jangan render apa pun jika tidak ada query
  if (!fullQuery) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-2 mb-4 overflow-x-auto whitespace-nowrap"
      style={{ scrollbarWidth: "none" }} // Hide scrollbar for browsers supporting it
      // Add fallback for Webkit browsers if needed:
      // className="flex items-center gap-2 mb-4 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden"
    >
      {/* Tombol Hapus Semua */}
      <button
        onClick={onClearSearch}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 text-gray-700 cursor-pointer flex-shrink-0" // Added flex-shrink-0
      >
        <FaTrashAlt className="w-3 h-3" />
        Hapus Semua
      </button>

      {/* Separator hanya jika ada tag brand atau model */}
      {(brand || modelQuery) && (
        <div className="h-5 border-l border-gray-300 flex-shrink-0"></div>
      )}

      {/* Tag Brand */}
      {brand && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm bg-white border border-gray-300 rounded-full shadow-sm text-gray-700 flex-shrink-0">
          <span>{brand}</span>
          <button
            onClick={onRemoveBrand}
            className="ml-1 text-gray-400 hover:text-gray-600 cursor-pointer"
            aria-label={`Hapus filter ${brand}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tag Model/Sisa Query */}
      {modelQuery && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm bg-white border border-gray-300 rounded-full shadow-sm text-gray-700 flex-shrink-0">
          <span>{modelQuery}</span>
          <button
            onClick={onRemoveModel}
            className="ml-1 text-gray-400 hover:text-gray-600 cursor-pointer"
            aria-label={`Hapus filter ${modelQuery}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Fallback jika query ada tapi tidak terpecah (brand dan modelQuery null) */}
      {!brand && !modelQuery && fullQuery && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm bg-white border border-gray-300 rounded-full shadow-sm text-gray-700 flex-shrink-0">
          <span>{fullQuery}</span>
          <button
            onClick={onClearSearch} // Jika hanya 1 tag fallback, hapus semua
            className="ml-1 text-gray-400 hover:text-gray-600"
            aria-label="Hapus filter pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ActiveSearchFilters;
