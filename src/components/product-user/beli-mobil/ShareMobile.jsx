// components/product-user/beli-mobil/ShareMobile.jsx
import React, { useState, useEffect, useRef } from "react";

// Import Icon
import { X } from "lucide-react";
import { FaCopy, FaCheck } from "react-icons/fa";

const ShareMobile = ({
  isOpen,
  onClose,
  url,
  title,
  shareOptions,
  onCopy,
  copySuccess,
}) => {
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const popoverRef = useRef(null);
  const touchStartY = useRef(null);
  const popoverTranslateY = useRef(0);

  // Efek untuk animasi masuk
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsAnimatingIn(true);
      }, 10); // Sedikit delay untuk memastikan transisi CSS diterapkan
      return () => clearTimeout(timer);
    } else {
      setIsAnimatingIn(false); // Reset saat ditutup
    }
  }, [isOpen]);

  // Efek untuk mengunci scroll body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimatingIn(false); // Mulai animasi keluar
    setTimeout(() => {
      onClose(); // Panggil onClose setelah animasi selesai
    }, 300); // Sesuaikan dengan durasi transisi CSS (duration-300)
  };

  // --- Handle Touch Events for Mobile Popover Drag ---
  const handleTouchStart = (e) => {
    if (!popoverRef.current) return;
    touchStartY.current = e.touches[0].clientY;
    popoverRef.current.style.transition = "none"; // Hapus transisi saat drag
    const computedStyle = window.getComputedStyle(popoverRef.current);
    const transformMatrix = new DOMMatrix(computedStyle.transform);
    popoverTranslateY.current = transformMatrix.m42;
  };

  const handleTouchMove = (e) => {
    if (!popoverRef.current || touchStartY.current === null) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    let newTranslateY = popoverTranslateY.current + deltaY;

    if (newTranslateY < 0) {
      newTranslateY = 0; // Batasi drag ke atas
    }

    popoverRef.current.style.transform = `translateY(${newTranslateY}px)`;
  };

  const handleTouchEnd = () => {
    if (!popoverRef.current || touchStartY.current === null) return;

    const popoverHeight = popoverRef.current.offsetHeight;
    const threshold = popoverHeight * 0.3; // Threshold 30%

    const computedStyle = window.getComputedStyle(popoverRef.current);
    const transformMatrix = new DOMMatrix(computedStyle.transform);
    const currentTranslateY = transformMatrix.m42;

    popoverRef.current.style.transition = "transform 0.3s ease-out"; // Tambahkan kembali transisi

    if (currentTranslateY > threshold) {
      handleClose(); // Tutup jika drag melebihi threshold
    } else {
      // Kembalikan ke posisi semula
      popoverRef.current.style.transform = "translateY(0)";
      setIsAnimatingIn(true); // Pastikan state animasi sesuai
    }

    touchStartY.current = null;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/50 z-40 backdrop-blur-xs transition-opacity duration-300 ${
          isAnimatingIn ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      ></div>

      {/* Popover Content */}
      <div
        ref={popoverRef}
        id="share-popover-mobile"
        className={`fixed bottom-0 left-0 right-0 w-full bg-white rounded-t-2xl shadow-xl z-50 p-4 pb-6
                       transform transition-transform duration-300 ease-out`}
        style={{
          transform: isAnimatingIn ? "translateY(0)" : "translateY(100%)",
          touchAction: "none", // Penting untuk handle touch manual
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-popover-mobile-title"
      >
        {/* Drag Handle */}
        <div
          className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        ></div>

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3
            id="share-popover-mobile-title"
            className="text-lg font-semibold text-gray-800"
          >
            Bagikan Dengan Teman!
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-1 -mr-1 rounded-full hover:bg-gray-100"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Icons */}
        <div className="flex justify-around items-center mb-5 text-center">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => {
                option.handler();
                handleClose(); // Tutup setelah klik share
              }}
              className="flex flex-col items-center transition group rounded-md p-1 cursor-pointer space-y-1"
              aria-label={`Bagikan ke ${option.name}`}
            >
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full group-hover:bg-gray-200 transition">
                <option.icon className={`w-6 h-6 ${option.color}`} />
              </div>
              <span className="text-xs text-gray-600">{option.name}</span>
            </button>
          ))}
        </div>

        {/* URL and Copy Button */}
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
            className={`flex items-center text-sm font-medium px-2 py-1 rounded-lg cursor-pointer transition duration-150 ease-in-out whitespace-nowrap ${
              copySuccess === "Disalin"
                ? "bg-gray-200 text-gray-800"
                : copySuccess === "Gagal"
                ? "bg-red-100 text-red-700"
                : "hover:bg-gray-200 text-gray-500"
            }`}
          >
            {copySuccess === "Disalin" ? (
              <FaCheck className="w-4 h-4 mr-1.5" />
            ) : (
              <FaCopy className="w-4 h-4 mr-1.5" />
            )}
            {copySuccess || "Salin"}
          </button>
        </div>
      </div>
    </>
  );
};

export default ShareMobile;