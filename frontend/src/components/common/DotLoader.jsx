// frontend/src/components/common/DotLoader.jsx
"use client";
import React from "react";

const DotLoader = ({
  containerClassName = "",
  dotCommonClassName = "rounded-full",
  dotSizeClassName = "w-3 h-3",
  dotColorClassName = "bg-gradient-to-r from-orange-500 to-amber-500",
  text = "",
  textSizeClassName = "text-sm",
  textColorClassName = "text-gray-700 animate-pulse",
}) => {
  const animationBaseClass =
    "animate-[bounce-delay_1.4s_infinite_ease-in-out_both]";

  return (
    <div
      className={`flex flex-col items-center justify-center ${containerClassName}`}
    >
      <div className="flex space-x-2">
        <div
          className={`${animationBaseClass} ${dotCommonClassName} ${dotSizeClassName} ${dotColorClassName}`}
          style={{ animationDelay: "-0.32s" }}
        ></div>
        <div
          className={`${animationBaseClass} ${dotCommonClassName} ${dotSizeClassName} ${dotColorClassName}`}
          style={{ animationDelay: "-0.16s" }}
        ></div>
        <div
          className={`${animationBaseClass} ${dotCommonClassName} ${dotSizeClassName} ${dotColorClassName}`}
        ></div>
      </div>
      {text && (
        <p className={`mt-3 ${textSizeClassName} ${textColorClassName}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default DotLoader;
