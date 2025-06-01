// components/product-user/beli-mobil/ShareDekstop.jsx
import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCopy } from "react-icons/fa";
import AnimatedCheckmark from "@/components/animate-icon/AnimatedCheckmark";

const dropDownVariant = {
  open: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  closed: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
};

const ShareDekstop = ({
  isOpen,
  onClose,
  url,
  shareOptions,
  onCopy,
  copySuccess,
  buttonRef,
}) => {
  const popoverRef = useRef(null);

  const handleClickOutside = useCallback(
    (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        onClose();
      }
    },
    [onClose, buttonRef]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          id="share-popover-desktop"
          className="absolute top-10 lg:top-14 right-0 w-80 sm:w-96
                     bg-white rounded-lg shadow-xl border border-gray-200 z-30
                     origin-top-right"
          variants={dropDownVariant}
          initial="closed"
          animate="open"
          exit="closed"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-popover-desktop-title"
        >
          <div className="absolute -top-2 right-3 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
          <div className="p-4">
            <h3
              id="share-popover-desktop-title"
              className="text-md font-medium text-gray-700 mb-3"
            >
              Bagikan dengan Teman!
            </h3>

            <div className="flex justify-around items-center mb-4 text-center">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    option.handler();
                    onClose();
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
                className={`flex items-center justify-center text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 ease-in-out whitespace-nowrap ${
                  copySuccess === "Disalin"
                    ? "bg-green-50 text-green-700 ring-1 ring-green-100"
                    : copySuccess === "Gagal"
                    ? "bg-red-100 text-red-700 ring-1 ring-red-200"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
                disabled={copySuccess === "Disalin"}
                style={{ minWidth: "80px" }}
              >
                {copySuccess === "Disalin" ? (
                  <div className="flex items-center justify-center space-x-1">
                    <AnimatedCheckmark size={16} />
                    <span>Disalin</span>
                  </div>
                ) : copySuccess === "Gagal" ? (
                  <>
                    <FaCopy className="w-3.5 h-3.5 mr-1.5" /> Gagal
                  </>
                ) : (
                  <>
                    <FaCopy className="w-3.5 h-3.5 mr-1.5" />
                    Salin
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareDekstop;
