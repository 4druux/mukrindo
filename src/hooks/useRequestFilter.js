import { useState, useCallback } from "react";

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

export const displayableFilterOptions = [
  { type: "status", value: SELL_REQUEST_STATUS_FILTER.ALL, label: "Semua Status" },
  { type: "status", value: SELL_REQUEST_STATUS_FILTER.PENDING, label: "Pending" },
  { type: "status", value: SELL_REQUEST_STATUS_FILTER.CONTACTED, label: "Dihubungi" },
  { type: "status", value: SELL_REQUEST_STATUS_FILTER.COMPLETED, label: "Selesai" },
  { type: "status", value: SELL_REQUEST_STATUS_FILTER.CANCELLED, label: "Dibatalkan" },
  { type: "location", value: SELL_REQUEST_LOCATION_FILTER.SHOWROOM, label: "Showroom" },
  { type: "location", value: SELL_REQUEST_LOCATION_FILTER.HOME, label: "Rumah Pelanggan" },
  { type: "sortBy", value: SELL_REQUEST_SORT_ORDER.NEAREST_INSPECTION, label: "Waktu Inspeksi Terdekat" },
];

export const defaultFilters = {
  status: SELL_REQUEST_STATUS_FILTER.ALL,
  location: SELL_REQUEST_LOCATION_FILTER.ALL,
  sortBy: SELL_REQUEST_SORT_ORDER.LATEST_CREATED,
};

const useRequestFilter = (initialDefaultFilters = defaultFilters, onFilterChange = () => {}) => {
  const [activeFilters, setActiveFilters] = useState(initialDefaultFilters);
  const [visuallyActiveFilter, setVisuallyActiveFilter] = useState({
    type: "status",
    value: initialDefaultFilters.status,
  });

  const handleFilterClick = useCallback((clickedType, clickedValue) => {
      const newLogicalFilters = {
        ...initialDefaultFilters,
        [clickedType]: clickedValue,
      };

      setActiveFilters(newLogicalFilters);
      setVisuallyActiveFilter({ type: clickedType, value: clickedValue });

      if (typeof onFilterChange === 'function') {
          onFilterChange(newLogicalFilters);
      }
  }, [initialDefaultFilters, onFilterChange]);

  const setActiveVisualFilter = useCallback((type, value) => {
      setVisuallyActiveFilter({ type, value });
  }, []);


  return {
    activeFilters,
    visuallyActiveFilter,
    handleFilterClick,
    setActiveVisualFilter,
  };
};

export default useRequestFilter;