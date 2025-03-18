// components/AnimatedPlaceholder.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AnimatedPlaceholder = ({ placeholderTexts, className }) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlaceholderIndex(
        (prevIndex) => (prevIndex + 1) % placeholderTexts.length
      );
    }, 3000);
    return () => clearInterval(intervalId);
  }, [placeholderTexts.length]);

  return (
    <AnimatePresence>
      <motion.span
        key={placeholderIndex}
        className={`absolute inset-0 flex items-center text-xs text-gray-600 ${className}`}
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        exit={{ y: "-100%" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {placeholderTexts[placeholderIndex]}
      </motion.span>
    </AnimatePresence>
  );
};

export default AnimatedPlaceholder;
