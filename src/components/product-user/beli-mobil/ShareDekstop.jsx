// components/product-user/beli-mobil/ShareDekstop.jsx
import React, { useEffect, useRef } from "react";

// Import Icon
import { FaCopy, FaCheck } from "react-icons/fa";

const ShareDekstop = ({
  isOpen,
  onClose,
  url,
  title,
  shareOptions,
  onCopy,
  copySuccess,
  buttonRef, // Tambahkan buttonRef untuk positioning
}) => {
  const popoverRef = useRef(null);

  // Efek untuk menutup popover saat klik di luar (hanya desktop)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        buttonRef.current && // Pastikan buttonRef ada
        !buttonRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]); // Tambahkan buttonRef ke dependencies

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      id="share-popover-desktop"
      className="absolute top-10 lg:top-14 right-0 w-80 sm:w-96
                     bg-white rounded-lg shadow-xl border border-gray-200 z-30
                     transform transition-all duration-200 ease-out
                     origin-top-right
                     scale-95 opacity-0 data-[enter]:scale-100 data-[enter]:opacity-100"
      style={{
        // Gunakan style inline untuk transisi yang lebih andal
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? "scale(1)" : "scale(0.95)",
        transition: "opacity 200ms ease-out, transform 200ms ease-out",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-popover-desktop-title"
      // Atribut data-[enter] bisa digunakan jika memakai library seperti Headless UI
      // tapi dengan style inline, ini tidak wajib.
      // data-enter={isOpen ? "" : undefined}
    >
      {/* Arrow Tip */}
      <div className="absolute -top-2 right-3 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>

      <div className="p-4">
        <h3
          id="share-popover-desktop-title"
          className="text-md font-semibold text-gray-800 mb-3"
        >
          Bagikan dengan Teman!
        </h3>

        {/* Share Icons */}
        <div className="flex justify-around items-center mb-4 text-center">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => {
                option.handler();
                onClose(); // Tutup setelah klik share
              }}
              className="flex flex-col items-center transition group rounded-md p-1 cursor-pointer"
              aria-label={`Bagikan ke ${option.name}`}
            >
              <option.icon
                className={`w-6 h-6 mb-1 ${option.color} group-hover:scale-110 transition-transform`}
              />
              <span className="text-xs">{option.name}</span>
            </button>
          ))}
        </div>

        {/* URL and Copy Button */}
        <div className="flex items-center bg-gray-100 border border-gray-200 rounded-xl py-2 px-3">
          <input
            type="text"
            readOnly
            value={url}
            className="flex-grow bg-transparent text-sm text-gray-700 truncate mr-2 focus:outline-none"
            aria-label="URL untuk dibagikan"
          />
          <button
            onClick={onCopy}
            className={`flex items-center text-xs px-2 py-1 rounded cursor-pointer ${
              copySuccess === "Disalin"
                ? "bg-gray-200 text-gray-700"
                : copySuccess === "Gagal"
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            } transition duration-150 ease-in-out whitespace-nowrap`}
          >
            {copySuccess === "Disalin" ? (
              <FaCheck className="w-3.5 h-3.5 mr-1" />
            ) : (
              <FaCopy className="w-3.5 h-3.5 mr-1" />
            )}
            {copySuccess || "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareDekstop;
