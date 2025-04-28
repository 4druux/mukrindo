// components/global/ScrollHorizontal.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const ScrollHorizontal = ({
  children,
  className = "",
  buttonVerticalAlign = "center",
}) => {
  const scrollContainerRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const hasOverflow = container.scrollWidth > container.clientWidth;
      setIsOverflowing(hasOverflow);

      if (hasOverflow) {
        const scrollLeft = Math.ceil(container.scrollLeft);
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;

        const tolerance = 1;

        setShowLeftButton(scrollLeft > tolerance);
        setShowRightButton(scrollLeft < scrollWidth - clientWidth - tolerance);
      } else {
        setShowLeftButton(false);
        setShowRightButton(false);
      }
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScroll();

      container.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);

      const resizeObserver = new ResizeObserver(checkScroll);
      resizeObserver.observe(container);

      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
        resizeObserver.unobserve(container);
      };
    }
  }, [checkScroll, children]);
  const scroll = (amount) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: amount,
        behavior: "smooth",
      });

      setTimeout(checkScroll, 300);
    }
  };

  const scrollLeft = () => scroll(-200);
  const scrollRight = () => scroll(200);

  const buttonBaseClasses =
    "absolute z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 cursor-pointer hidden md:block";
  const buttonPositionClasses =
    buttonVerticalAlign === "center" ? "top-1/2 -translate-y-1/2" : "top-0";

  return (
    <div className="relative flex items-start w-full">
      {/* Tombol Scroll Kiri */}
      {isOverflowing && showLeftButton && (
        <button
          onClick={scrollLeft}
          className={`${buttonBaseClasses} left-0 ${buttonPositionClasses}`}
          aria-label="Scroll Left"
          style={{
            transform: `translateX(-50%) ${
              buttonVerticalAlign === "center" ? "translateY(-50%)" : ""
            }`,
          }}
        >
          <BsChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Kontainer Konten yang Bisa Scroll */}
      <div
        ref={scrollContainerRef}
        className={`flex items-center gap-2 overflow-x-auto w-full ${className}`}
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>

      {/* Tombol Scroll Kanan */}
      {isOverflowing && showRightButton && (
        <button
          onClick={scrollRight}
          className={`${buttonBaseClasses} right-0 ${buttonPositionClasses}`}
          aria-label="Scroll Right"
          style={{
            transform: `translateX(50%) ${
              buttonVerticalAlign === "center" ? "translateY(-50%)" : ""
            }`,
          }}
        >
          <BsChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default ScrollHorizontal;
