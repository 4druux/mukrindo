// components/global/AllFilter.jsx
import React, { useState, useRef, useEffect } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

export const ALL_FILTER_TYPES = {
  RECOMMENDATION: "recommendation",
  LATEST: "latest",
  YEAR_DESC: "year_desc",
  PRICE_ASC: "price_asc",
  PRICE_UNDER_150: "price_under_150",
  PRICE_BETWEEN_150_300: "price_between_150_300",
  PRICE_OVER_300: "price_over_300",
};

const filterLabels = {
  [ALL_FILTER_TYPES.RECOMMENDATION]: "Rekomendasi",
  [ALL_FILTER_TYPES.LATEST]: "Mobil Terbaru",
  [ALL_FILTER_TYPES.YEAR_DESC]: "Tahun Terbaru",
  [ALL_FILTER_TYPES.PRICE_ASC]: "Harga Terendah",
  [ALL_FILTER_TYPES.PRICE_UNDER_150]: "Dibawah 150 Juta",
  [ALL_FILTER_TYPES.PRICE_BETWEEN_150_300]: "150 - 300 Juta",
  [ALL_FILTER_TYPES.PRICE_OVER_300]: "Diatas 300 Juta",
};

const AllFilter = ({ activeFilter, setActiveFilter, excludeFilters = [] }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const getButtonClass = (filterType) => {
    return `flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
      activeFilter === filterType
        ? "bg-orange-100 text-orange-500 border border-orange-500"
        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
    }`;
  };

  const filtersToShow = Object.entries(ALL_FILTER_TYPES).filter(
    ([key, value]) => !excludeFilters.includes(value)
  );

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const hasOverflow = container.scrollWidth > container.clientWidth;
      setIsOverflowing(hasOverflow);

      if (hasOverflow) {
        const scrollLeft = Math.round(container.scrollLeft);
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;

        setShowLeftButton(scrollLeft > 0);
        setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1);
      } else {
        setShowLeftButton(false);
        setShowRightButton(false);
      }
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);

      const resizeObserver = new ResizeObserver(checkScroll);
      resizeObserver.observe(container);

      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
        resizeObserver.unobserve(container);
      };
    }
  }, [filtersToShow]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <div className="relative flex items-start mb-4">
        <div className="hidden md:block">
          {isOverflowing && showLeftButton && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 cursor-pointer"
              aria-label="Scroll Left"
              style={{ transform: "translateX(-90%)" }}
            >
              <BsChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
        <div
          ref={scrollContainerRef}
          className="flex space-x-2 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {filtersToShow.map(([key, filterType]) => (
            <button
              key={filterType}
              onClick={() => setActiveFilter(filterType)}
              className={getButtonClass(filterType)}
            >
              {filterLabels[filterType]}
            </button>
          ))}
        </div>

        <div className="hidden md:block">
          {isOverflowing && showRightButton && (
            <button
              onClick={scrollRight}
              className="absolute right-0 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 cursor-pointer"
              aria-label="Scroll Right"
              style={{ transform: "translateX(60%)" }}
            >
              <BsChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default AllFilter;
