import { useState, useRef, useEffect } from "react";

export const useYearDropdown = (initialYear = new Date().getFullYear()) => {
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const yearDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target)
      ) {
        setIsYearDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return {
    currentYear,
    setCurrentYear,
    isYearDropdownOpen,
    setIsYearDropdownOpen,
    yearDropdownRef,
  };
};
