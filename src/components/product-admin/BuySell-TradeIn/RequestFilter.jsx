import React from "react";
import ScrollHorizontal from "@/components/common/ScrollHorizontal";

const RequestFilter = ({
  filterOptions,
  visuallyActiveFilter,
  onFilterClick,
}) => {
  const getButtonClass = (buttonType, buttonValue) => {
    const isActive =
      visuallyActiveFilter.type === buttonType &&
      visuallyActiveFilter.value === buttonValue;
    return `flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
      isActive
        ? "bg-orange-100 text-orange-500 border border-orange-500"
        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
    }`;
  };

  return (
    <div className="mb-5">
      <ScrollHorizontal buttonVerticalAlign="top">
        {filterOptions.map((option) => (
          <button
            key={`${option.type}-${option.value}`}
            onClick={() => onFilterClick(option.type, option.value)}
            className={getButtonClass(option.type, option.value)}
            aria-pressed={
              visuallyActiveFilter.type === option.type &&
              visuallyActiveFilter.value === option.value
            }
          >
            {option.label}
          </button>
        ))}
      </ScrollHorizontal>
    </div>
  );
};

export default RequestFilter;
