import React, { useRef, useEffect } from "react";
import ScrollHorizontal from "@/components/common/ScrollHorizontal";

export const SELL_REQUEST_STATUS_FILTER = {
  ALL: "all_status",
  PENDING: "Pending",
  CONTACTED: "Dihubungi",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};
export const SELL_REQUEST_LOCATION_FILTER = {
  ALL: "all_location",
  SHOWROOM: "showroom",
  HOME: "home",
};

export const SELL_REQUEST_SORT_ORDER = {
  LATEST_CREATED: "latest_created",
  NEAREST_INSPECTION: "nearest_inspection",
};

export const TRADE_IN_STATUS_FILTER = {
  ALL: "all_status",
  PENDING: "Pending",
  CONTACTED: "Dihubungi",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};
export const TRADE_IN_LOCATION_FILTER = {
  ALL: "all_location",
  SHOWROOM: "showroom",
  HOME: "home",
};
export const TRADE_IN_SORT_ORDER = {
  LATEST_CREATED: "latest_created",
  NEAREST_INSPECTION: "nearest_inspection",
};

export const NOTIFY_STATUS_FILTER = {
  ALL: "all_status",
  PENDING: "Pending",
  CONTACTED: "Dihubungi",
};

export const NOTIFY_SORT_ORDER = {
  LATEST_CREATED: "latest_created",
};

const buySellDisplayableOptions = [
  {
    type: "status",
    value: SELL_REQUEST_STATUS_FILTER.ALL,
    label: "Semua Status",
  },
  {
    type: "status",
    value: SELL_REQUEST_STATUS_FILTER.PENDING,
    label: "Pending",
  },
  {
    type: "status",
    value: SELL_REQUEST_STATUS_FILTER.CONTACTED,
    label: "Dihubungi",
  },
  {
    type: "status",
    value: SELL_REQUEST_STATUS_FILTER.COMPLETED,
    label: "Selesai",
  },
  {
    type: "status",
    value: SELL_REQUEST_STATUS_FILTER.CANCELLED,
    label: "Dibatalkan",
  },
  {
    type: "location",
    value: SELL_REQUEST_LOCATION_FILTER.SHOWROOM,
    label: "Showroom",
  },
  {
    type: "location",
    value: SELL_REQUEST_LOCATION_FILTER.HOME,
    label: "Rumah Pelanggan",
  },
  {
    type: "sortBy",
    value: SELL_REQUEST_SORT_ORDER.NEAREST_INSPECTION,
    label: "Waktu Inspeksi Terdekat",
  },
];

const tradeInDisplayableOptions = [
  { type: "status", value: TRADE_IN_STATUS_FILTER.ALL, label: "Semua Status" },
  { type: "status", value: TRADE_IN_STATUS_FILTER.PENDING, label: "Pending" },
  {
    type: "status",
    value: TRADE_IN_STATUS_FILTER.CONTACTED,
    label: "Dihubungi",
  },
  { type: "status", value: TRADE_IN_STATUS_FILTER.COMPLETED, label: "Selesai" },
  {
    type: "status",
    value: TRADE_IN_STATUS_FILTER.CANCELLED,
    label: "Dibatalkan",
  },
  {
    type: "location",
    value: TRADE_IN_LOCATION_FILTER.SHOWROOM,
    label: "Showroom",
  },
  {
    type: "location",
    value: TRADE_IN_LOCATION_FILTER.HOME,
    label: "Rumah Pelanggan",
  },
  {
    type: "sortBy",
    value: TRADE_IN_SORT_ORDER.NEAREST_INSPECTION,
    label: "Waktu Inspeksi Terdekat",
  },
];

export const notifyMeDisplayableOptions = [
  { type: "status", value: NOTIFY_STATUS_FILTER.ALL, label: "Semua Status" },
  { type: "status", value: NOTIFY_STATUS_FILTER.PENDING, label: "Pending" },
  {
    type: "status",
    value: NOTIFY_STATUS_FILTER.CONTACTED,
    label: "Dihubungi",
  },
];

const RequestFilter = ({
  requestType,
  visuallyActiveFilter,
  onFilterClick,
}) => {
  const buttonRefs = useRef({});
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const scrollToActiveButton = () => {
      if (visuallyActiveFilter?.type && visuallyActiveFilter?.value) {
        const activeButtonKey = `${visuallyActiveFilter.type}-${visuallyActiveFilter.value}`;
        if (buttonRefs.current[activeButtonKey]) {
          const activeButton = buttonRefs.current[activeButtonKey];
          activeButton.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
          });
        }
      }
    };

    scrollToActiveButton();
  }, [visuallyActiveFilter]);

  const filterOptions =
    requestType === "tradeIn"
      ? tradeInDisplayableOptions
      : requestType === "buySell"
      ? buySellDisplayableOptions
      : notifyMeDisplayableOptions;

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
      <ScrollHorizontal buttonVerticalAlign="top" ref={scrollContainerRef}>
        {filterOptions.map((option) => {
          const buttonKey = `${option.type}-${option.value}`;
          return (
            <button
              ref={(el) => (buttonRefs.current[buttonKey] = el)}
              key={buttonKey}
              onClick={() => onFilterClick(option.type, option.value)}
              className={getButtonClass(option.type, option.value)}
              aria-pressed={
                visuallyActiveFilter?.type === option.type &&
                visuallyActiveFilter?.value === option.value
              }
            >
              {option.label}
            </button>
          );
        })}
      </ScrollHorizontal>
    </div>
  );
};

export default RequestFilter;
