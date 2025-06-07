// components/common/MagneticButton.jsx

import React, { forwardRef } from "react";
import { motion, useAnimation } from "framer-motion";

const MagneticButton = forwardRef(
  ({ onClick, icon, children, className, ...props }, ref) => {
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

    const baseClasses = `
      relative inline-flex items-center justify-center px-8 py-3 m-2 text-sm font-medium tracking-wider 
      border border-orange-500 rounded-full overflow-hidden transition-all duration-1000 ease-in-out 
       cursor-pointer group hover:shadow-[0_0_20px_rgba(234,88,12,0.4)]
    `;

    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${baseClasses} ${className || ""}`}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center text-orange-600 group-hover:text-white transition-transform duration-1000 ease-in-out group-hover:scale-105">
          {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}

          <motion.span className="block relative" data-text={children}>
            {children}
          </motion.span>
        </span>

        <motion.div
          animate={fillControls}
          initial={{ y: "80%" }}
          className="absolute top-[-50%] left-[-25%] w-[150%] h-[250%] bg-gradient-to-br from-red-500 via-orange-400 to-yellow-400
          rounded-[50%] pointer-events-none z-0"
        />
      </motion.button>
    );
  }
);

MagneticButton.displayName = "MagneticButton";

export default MagneticButton;
