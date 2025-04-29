import React from "react";
import { FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Accordion = ({ title, description, isOpen, onToggle }) => {
  const renderDescription = () => {
    if (!Array.isArray(description)) {
      if (typeof description === "string") {
        return (
          <p className="text-gray-700 text-xs lg:text-sm">{description}</p>
        );
      }
      return null;
    }

    return description.map((element, index) => {
      if (typeof element === "string") {
        return (
          <p key={index} className="text-gray-700 text-xs lg:text-sm mb-2">
            {element}
          </p>
        );
      } else if (
        typeof element === "object" &&
        element !== null &&
        Array.isArray(element.items)
      ) {
        const listItems = element.items.map((item, liIndex) => (
          <li key={liIndex}>{item}</li>
        ));

        if (element.type === "ordered") {
          return (
            <ol
              key={index}
              className="list-decimal list-inside text-gray-700 text-xs lg:text-sm space-y-1 ml-4 mb-2"
            >
              {listItems}
            </ol>
          );
        } else {
          return (
            <ul
              key={index}
              className="list-disc list-inside text-gray-700 text-xs lg:text-sm space-y-1 ml-4 mb-2"
            >
              {listItems}
            </ul>
          );
        }
      }
      return null;
    });
  };

  const contentVariant = {
    open: {
      opacity: 1,
      height: "auto",
      y: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    closed: {
      opacity: 0,
      height: 0,
      y: -10,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <div
      className={`border border-gray-200 mb-3 overflow-hidden transition-[border-radius] duration-1000 ease-in-out ${
        isOpen ? "rounded-xl" : "rounded-4xl"
      }`}
    >
      <button
        onClick={onToggle}
        className="flex justify-between items-center gap-2 w-full p-4 text-left bg-white focus:outline-none cursor-pointer"
        aria-expanded={isOpen}
      >
        <h3 className="text-sm lg:text-md font-semibold text-gray-600">
          {title}
        </h3>
        <motion.span
          className="text-gray-500"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: "inline-block" }}
        >
          <FaChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="closed"
            animate="open"
            exit="closed"
            variants={contentVariant}
            className="overflow-hidden"
          >
            <div className="px-4 pb-2 bg-white"> {renderDescription()} </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accordion;
