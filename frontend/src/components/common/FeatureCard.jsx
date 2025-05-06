// components/common/FeatureCard.jsx
import React from "react";
import { FaArrowRight } from "react-icons/fa";

const FeatureCard = ({
  icon: IconComponent,
  imgSrc,
  title,
  description,
  linkUrl,
  iconBgColor = "bg-orange-600",
  iconColor = "text-white",
  iconSize = "w-10 h-10",
  iconContainerSize = "w-20 h-20",
}) => {
  const hasImage = !!imgSrc;

  return linkUrl ? (
    <a
      href={linkUrl}
      rel="noopener noreferrer"
      className={`bg-white border-y border-gray-200 md:rounded-2xl md:shadow-md lg:hover:shadow-lg transition-shadow duration-200 h-full flex overflow-hidden ${
        hasImage
          ? "flex-col lg:flex-row lg:items-center lg:p-5"
          : "flex-row items-center p-5 gap-4"
      }`}
    >
      {!!IconComponent && !hasImage && (
        <div
          className={`flex-shrink-0 ${iconContainerSize} flex items-center justify-center ${iconBgColor} rounded-full`}
        >
          <IconComponent className={`${iconSize} ${iconColor}`} />
        </div>
      )}
      {hasImage && (
        <div
          className={`flex-shrink-0 w-full aspect-[16/9] lg:w-32 lg:aspect-square`}
        >
          <img
            src={imgSrc}
            alt={`${title} image`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div
        className={`flex-grow flex flex-col ${
          hasImage ? "px-4 text-left" : ""
        }`}
      >
        <div className="flex-grow">
          <h2 className="text-md font-semibold text-gray-700 mb-1">{title}</h2>
          <p className="text-xs text-gray-600 leading-relaxed whitespace-normal">
            {description}
          </p>
        </div>

        <div className="py-4 text-right">
          <span
            className="text-xs font-semibold text-orange-600 hover:text-orange-500 inline-flex items-center gap-1"
            aria-hidden="true"
          >
            Selengkapnya
            <span>
              <FaArrowRight />
            </span>
          </span>
        </div>
      </div>
    </a>
  ) : (
    <div
      className={`bg-white border border-gray-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 h-full flex overflow-hidden ${
        hasImage
          ? "flex-col lg:flex-row lg:items-center lg:p-5"
          : "flex-row items-center p-5 gap-4"
      }`}
    >
      {!!IconComponent && !hasImage && (
        <div
          className={`flex-shrink-0 ${iconContainerSize} flex items-center justify-center ${iconBgColor} rounded-full`}
        >
          <IconComponent className={`${iconSize} ${iconColor}`} />
        </div>
      )}
      {hasImage && (
        <div
          className={`flex-shrink-0 w-full aspect-[16/9] lg:w-32 lg:aspect-square`}
        >
          <img
            src={imgSrc}
            alt={`${title} image`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div
        className={`flex-grow flex flex-col ${
          hasImage ? "px-4 text-left" : ""
        }`}
      >
        <div className="flex-grow">
          <h2 className="text-md font-semibold text-gray-700 mb-1">{title}</h2>
          <p className="text-xs text-gray-600 leading-relaxed whitespace-normal">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
