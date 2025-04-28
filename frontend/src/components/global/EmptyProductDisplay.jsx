// components/global/EmptyProductDisplay.jsx
import Link from "next/link";
import { FaBoxOpen } from "react-icons/fa";

const EmptyProductDisplay = ({
  emptyMessage,
  suggestedQuery,
  searchQuery,
  suggestionLinkHref,
  onSuggestionClick, // Tambahkan prop ini
}) => {
  return (
    <div className="flex justify-center items-center h-[50vh] text-center">
      <div className="flex flex-col sm:flex-row gap-4 items-center text-center sm:text-left">
        <FaBoxOpen className="w-24 h-24 sm:w-36 sm:h-36 text-gray-500" />
        <div className="flex flex-col text-gray-600 mt-4 sm:mt-0">
          <p className="text-2xl font-semibold">Oops!</p>
          <p>{emptyMessage}</p>
          {/* Tampilkan saran hanya jika ada suggestedQuery, searchQuery, dan suggestionLinkHref */}
          {suggestedQuery && searchQuery && suggestionLinkHref && (
            <p className="mt-2 text-sm">
              Mungkin maksud Anda:{" "}
              <Link
                href={suggestionLinkHref}
                className="text-orange-500 hover:underline"
                onClick={onSuggestionClick} // Gunakan callback jika ada
              >
                {suggestedQuery}
              </Link>
              ?
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyProductDisplay;