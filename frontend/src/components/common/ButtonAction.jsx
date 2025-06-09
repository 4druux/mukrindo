// frontend/src/components/common/ActionButton.jsx
import React from "react";
import { motion } from "framer-motion";

const ActionButton = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  ...props
}) => {
  const baseClasses = `
    relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white 
    rounded-full overflow-hidden
    cursor-pointer 
  `;

  const disabledClasses = `
    disabled:opacity-60 disabled:cursor-not-allowed
  `;

  const contentVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
  };

  const shineVariants = {
    rest: { x: "-150%" },
    hover: {
      x: "150%",
      transition: { duration: 0.7, ease: "easeInOut" },
    },
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabledClasses} ${className}`}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      initial="rest"
      whileHover="hover"
      animate="rest"
      {...props}
    >
      <span className="absolute inset-0 z-0 bg-gradient-to-br from-red-500 via-orange-400 to-yellow-400"></span>

      <motion.span
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent z-10"
        variants={shineVariants}
      />

      <motion.div
        className="relative z-10 flex items-center justify-center gap-2"
        variants={contentVariants}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {children}
      </motion.div>
    </motion.button>
  );
};

export default ActionButton;
