// components/product-user/beli-mobil/ShareMobile.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { FaCopy } from "react-icons/fa";
import AnimatedCheckmark from "@/components/animate-icon/AnimatedCheckmark";

const ShareMobile = ({
  isOpen,
  onClose,
  url,
  shareOptions,
  onCopy,
  copySuccess,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const popoverRef = useRef(null);
  const touchStartY = useRef(null);
  const popoverStartTranslateY = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setIsAnimatingOut(false);
      document.body.style.overflow = "hidden";
    } else if (isMounted && !isOpen) {
      setIsAnimatingOut(true);
      document.body.style.overflow = "auto";
      const timer = setTimeout(() => {
        setIsMounted(false);
        setIsAnimatingOut(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen, isMounted]);

  const handleHardClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleTouchStart = useCallback(
    (e) => {
      if (!popoverRef.current || !isMounted || isAnimatingOut) return;
      touchStartY.current = e.touches[0].clientY;
      const currentTransform = window.getComputedStyle(
        popoverRef.current
      ).transform;
      popoverStartTranslateY.current =
        currentTransform && currentTransform !== "none"
          ? new DOMMatrix(currentTransform).m42
          : 0;
      popoverRef.current.style.transition = "none";
    },
    [isMounted, isAnimatingOut]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (
        !popoverRef.current ||
        touchStartY.current === null ||
        !isMounted ||
        isAnimatingOut
      )
        return;
      const currentY = e.touches[0].clientY;
      let deltaY = currentY - touchStartY.current;
      let newTranslateY = popoverStartTranslateY.current + deltaY;
      if (newTranslateY < 0) newTranslateY = 0;
      popoverRef.current.style.transform = `translateY(${newTranslateY}px)`;
    },
    [isMounted, isAnimatingOut]
  );

  const handleTouchEnd = useCallback(() => {
    if (
      !popoverRef.current ||
      touchStartY.current === null ||
      !isMounted ||
      isAnimatingOut
    )
      return;
    const popoverHeight = popoverRef.current.offsetHeight;
    const threshold = popoverHeight * 0.35;
    const currentTransform = window.getComputedStyle(
      popoverRef.current
    ).transform;
    const currentTranslateY =
      currentTransform && currentTransform !== "none"
        ? new DOMMatrix(currentTransform).m42
        : 0;

    popoverRef.current.style.transition = "transform 0.3s ease-out";
    if (
      currentTranslateY > threshold &&
      currentTranslateY > popoverStartTranslateY.current
    ) {
      onClose();
    } else {
      popoverRef.current.style.transform = "translateY(0)";
    }
    touchStartY.current = null;
  }, [onClose, isMounted, isAnimatingOut]);

  if (!isMounted) return null;

  return (
    <>
      <div
        onClick={handleHardClose}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen && !isAnimatingOut
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

      <div
        ref={popoverRef}
        id="share-popover-mobile"
        className="fixed bottom-0 left-0 right-0 w-full bg-white rounded-t-2xl shadow-xl z-50 p-4 pb-6
                   transform transition-transform duration-300 ease-out"
        style={{
          transform:
            isOpen && !isAnimatingOut ? "translateY(0)" : "translateY(100%)",
          touchAction: "none",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-popover-mobile-title"
      >
        <div
          className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        ></div>

        <div className="flex justify-between items-center mb-4">
          <h3
            id="share-popover-mobile-title"
            className="text-md font-medium text-gray-700"
          >
            Bagikan Dengan Teman!
          </h3>
          <button
            onClick={handleHardClose}
            className="text-gray-500 hover:text-gray-700 p-1 -mr-1 rounded-full hover:bg-gray-100"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-x-2 gap-y-4 mb-5 text-center">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => {
                option.handler();
                onClose();
              }}
              className="flex flex-col items-center transition group rounded-md p-1 cursor-pointer space-y-1"
              aria-label={`Bagikan ke ${option.name}`}
            >
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full group-hover:bg-gray-200 transition">
                <option.icon className={`w-6 h-6 ${option.color}`} />
              </div>
              <span className="text-xs text-gray-600 truncate w-full px-1">
                {option.name}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center bg-gray-100 border border-gray-200 rounded-xl py-2.5 px-3">
          <input
            type="text"
            readOnly
            value={url}
            className="flex-grow bg-transparent text-sm text-gray-700 truncate mr-2 focus:outline-none"
            aria-label="URL untuk dibagikan"
          />
          <button
            onClick={onCopy}
            className={`flex items-center justify-center text-sm font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 ease-in-out whitespace-nowrap ${
              copySuccess === "Disalin"
                ? "bg-green-50 text-green-700 ring-1 ring-green-100"
                : copySuccess === "Gagal"
                ? "bg-red-100 text-red-700 ring-1 ring-red-200"
                : "bg-gray-200 hover:bg-gray-300 text-gray-500"
            }`}
            disabled={copySuccess === "Disalin"}
            style={{ minWidth: "85px" }}
          >
            {copySuccess === "Disalin" ? (
              <div className="flex items-center justify-center space-x-1">
                <AnimatedCheckmark size={18} />
                <span>Disalin</span>
              </div>
            ) : copySuccess === "Gagal" ? (
              <>
                <FaCopy className="w-4 h-4 mr-1.5" /> Gagal
              </>
            ) : (
              <>
                <FaCopy className="w-4 h-4 mr-1.5" />
                Salin
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default ShareMobile;
