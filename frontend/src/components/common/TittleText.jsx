import React from "react";

const TittleText = ({
  text,
  className = "",
  textSize = "text-md lg:text-lg",
  separator = true,
}) => {
  return (
    <div className={className}>
      <div className="inline-flex items-center gap-2">
        <h2
          className={`font-medium ${textSize} bg-clip-text text-gray-700 tracking-wide`}
        >
          {text}
        </h2>
        {separator && (
          <hr className="border-none h-[2px] w-8 rounded-full bg-gray-700" />
        )}
      </div>
    </div>
  );
};

export default TittleText;
