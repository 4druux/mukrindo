// components/FeatureCard.jsx
import React from "react";

const FeatureCard = ({
  icon: IconComponent,
  title,
  description,
  iconBgColor = "bg-orange-600",
  iconColor = "text-white",
  iconSize = "w-10 h-10",
  containerSize = "w-20 h-20",
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-md hover:shadow-lg p-5 flex items-center gap-4 transition-shadow duration-200 h-full">
      {IconComponent && (
        <div
          className={`flex-shrink-0 ${containerSize} ${iconBgColor} rounded-full flex items-center justify-center`}
        >
          <IconComponent className={`${iconSize} ${iconColor}`} />
        </div>
      )}

      <div className="flex-grow">
        <h2 className="text-md font-semibold text-gray-700 mb-1">{title}</h2>
        <p className="text-xs text-gray-600 leading-relaxed whitespace-normal">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
