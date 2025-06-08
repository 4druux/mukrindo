// frontend/src/components/common/ButtonMagnetic.jsx
import React, { forwardRef } from "react";
import { motion, useAnimation } from "framer-motion";

const ButtonMagnetic = forwardRef(
  (
    {
      onClick,
      icon,
      children,
      className,
      textColor = "#EA580C",
      borderColor = "#F97316",
      gradientFrom = "#EF4444",
      gradientVia = "#F97316",
      gradientTo = "#FBBF24",
      ...props
    },
    ref
  ) => {
    const fillControls = useAnimation();

    const handleMouseEnter = () => {
      fillControls.start({
        y: ["80%", "-10%"],
        transition: {
          ease: [0.19, 1, 0.22, 1],
          duration: 1.7,
        },
      });
    };

    const handleMouseLeave = () => {
      fillControls.start({
        y: "-80%",
        transition: {
          ease: [0.19, 1, 0.22, 1],
          duration: 1.7,
        },
      });
    };

    const contentVariants = {
      rest: {
        scale: 1,
        color: textColor,
        transition: { type: "spring", stiffness: 400, damping: 10 },
      },
      hover: {
        scale: 1.05,
        color: "#FFFFFF",
        transition: { type: "spring", stiffness: 400, damping: 10 },
      },
    };

    const baseClasses = `
      relative inline-flex items-center justify-center px-8 py-3 m-2 text-sm font-medium tracking-wider 
      rounded-full overflow-hidden
      cursor-pointer hover:shadow-[0_0_20px_rgba(234,88,12,0.4)]
    `;

    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${baseClasses} ${className || ""}`}
        style={{
          border: `1px solid ${borderColor}`,
        }}
        initial="rest"
        whileHover="hover"
        animate="rest"
        {...props}
      >
        <motion.span
          variants={contentVariants}
          className="relative z-10 flex items-center justify-center gap-2"
        >
          {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
          <motion.span className="block relative" data-text={children}>
            {children}
          </motion.span>
        </motion.span>

        <motion.div
          animate={fillControls}
          initial={{ y: "80%" }}
          className="absolute top-[-50%] left-[-25%] w-[150%] h-[250%] rounded-[50%] pointer-events-none z-0"
          style={{
            background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientVia}, ${gradientTo})`,
          }}
        />
      </motion.button>
    );
  }
);

ButtonMagnetic.displayName = "ButtonMagnetic";

export default ButtonMagnetic;
