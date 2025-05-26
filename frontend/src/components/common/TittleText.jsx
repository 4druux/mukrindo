import React from "react";

const TittleText = ({
  text,
  className = "",
  textSize = "text-md lg:text-xl",
  separator = true,
}) => {
  return (
    <div className={className}>
      <div className="inline-flex items-center gap-2">
        <h2
          className={`font-medium ${textSize} bg-clip-text text-transparent bg-gradient-to-t from-orange-200 to-orange-600 tracking-wider`}
        >
          {text}
        </h2>
        {separator && (
          <hr className="border-none h-[2px] w-8 rounded-full bg-gradient-to-t from-orange-200 to-orange-600" />
        )}
      </div>
    </div>
  );
};

export default TittleText;
