// components/global/ActiveSearchFilters.jsx
import { FaTrashAlt } from "react-icons/fa";
import { X } from "lucide-react";
import { formatNumber } from "@/utils/formatNumber";
import { INITIAL_PRICE_RANGE } from "@/components/product-user/beli/SearchFilters";
import ScrollHorizontal from "../common/ScrollHorizontal";

const displayableFilterParams = [
  "brand",
  "model",
  "type",
  "fuelType",
  "yearMin",
  "yearMax",
  "priceMin",
  "priceMax",
];

const ActiveSearchFilters = ({
  searchParams,
  splitResult,
  onClearAll,
  onRemoveSearchPart,
  onRemoveFilterParam,
  isAdminRoute = false,
}) => {
  const {
    brand: searchBrand,
    modelQuery: searchModelQuery,
    fullQuery,
  } = splitResult || {};

  const activeUrlFilters = [];
  let priceFilter = { min: null, max: null };
  let yearFilter = { min: null, max: null };

  displayableFilterParams.forEach((param) => {
    if (searchParams.has(param)) {
      const value = searchParams.get(param);
      if (param === "priceMin") {
        priceFilter.min = Number(value);
      } else if (param === "priceMax") {
        priceFilter.max = Number(value);
      } else if (param === "yearMin") {
        yearFilter.min = value;
      } else if (param === "yearMax") {
        yearFilter.max = value;
      } else {
        activeUrlFilters.push({
          key: param,
          label: value,
          originalParam: param,
        });
      }
    }
  });

  // Format combined price filter
  if (priceFilter.min !== null || priceFilter.max !== null) {
    const minPriceSet =
      priceFilter.min !== null && priceFilter.min !== INITIAL_PRICE_RANGE[0];
    const maxPriceSet =
      priceFilter.max !== null && priceFilter.max !== INITIAL_PRICE_RANGE[1];

    if (minPriceSet || maxPriceSet) {
      const displayMin =
        priceFilter.min !== null
          ? formatNumber(priceFilter.min)
          : formatNumber(INITIAL_PRICE_RANGE[0]);
      const displayMax =
        priceFilter.max !== null
          ? formatNumber(priceFilter.max)
          : formatNumber(INITIAL_PRICE_RANGE[1]);
      const priceLabel = `Rp${displayMin} - Rp${displayMax}`;
      activeUrlFilters.push({
        key: "priceRange",
        label: priceLabel,
        originalParam: ["priceMin", "priceMax"],
      });
    }
  }

  // Format combined year filter
  if (yearFilter.min !== null || yearFilter.max !== null) {
    let yearLabel = "";
    const minYearSet = yearFilter.min !== null;
    const maxYearSet = yearFilter.max !== null;

    if (minYearSet && maxYearSet) {
      yearLabel = `${yearFilter.min} - ${yearFilter.max}`;
    } else if (minYearSet) {
      yearLabel = `Dari ${yearFilter.min}`;
    } else if (maxYearSet) {
      yearLabel = `Sampai ${yearFilter.max}`;
    }

    if (minYearSet || maxYearSet) {
      activeUrlFilters.push({
        key: "yearRange",
        label: `Tahun ${yearLabel}`,
        originalParam: ["yearMin", "yearMax"],
      });
    }
  }

  // Combine filters from search query
  const activeSearchTags = [];
  if (searchBrand) {
    activeSearchTags.push({
      key: "searchBrand",
      label: searchBrand,
      onRemove: () => onRemoveSearchPart("brand"),
      ariaLabelSuffix: `pencarian ${searchBrand}`,
    });
  }
  if (searchModelQuery) {
    activeSearchTags.push({
      key: "searchModel",
      label: searchModelQuery,
      onRemove: () => onRemoveSearchPart("model"),
      ariaLabelSuffix: `pencarian ${searchModelQuery}`,
    });
  }
  if (!searchBrand && !searchModelQuery && fullQuery) {
    activeSearchTags.push({
      key: "searchFull",
      label: fullQuery,
      onRemove: () => onRemoveSearchPart("full"),
      ariaLabelSuffix: `pencarian ${fullQuery}`,
    });
  }

  const hasActiveFilters =
    activeSearchTags.length > 0 || activeUrlFilters.length > 0;

  if (!hasActiveFilters) {
    return null;
  }

  const renderTag = (key, label, onRemove, ariaLabelSuffix) => (
    <div
      key={key}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm bg-white border border-gray-300 rounded-full shadow-sm text-gray-700 flex-shrink-0"
    >
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="ml-1 text-gray-400 hover:text-gray-600 cursor-pointer"
        aria-label={`Hapus filter ${ariaLabelSuffix || label}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="mb-4">
      <ScrollHorizontal
        className={`gap-2 ${isAdminRoute ? "" : "lg:px-2"}`}
        buttonVerticalAlign="top"
      >
        {/* Clear All Button */}
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 text-gray-700 cursor-pointer flex-shrink-0"
        >
          <FaTrashAlt className="w-3 h-3" />
          Hapus Semua
        </button>

        {/* Separator */}
        <div className="h-5 border-l border-gray-300 flex-shrink-0"></div>

        {activeSearchTags.map((tag) =>
          renderTag(tag.key, tag.label, tag.onRemove, tag.ariaLabelSuffix)
        )}

        {/* Render URL Filter Tags */}
        {activeUrlFilters.map((filter) => {
          const handleRemove = () => {
            if (Array.isArray(filter.originalParam)) {
              filter.originalParam.forEach((p) => onRemoveFilterParam(p));
            } else {
              onRemoveFilterParam(filter.originalParam);
            }
          };
          return renderTag(
            filter.key,
            filter.label,
            handleRemove,
            filter.label
          );
        })}
      </ScrollHorizontal>
    </div>
  );
};

export default ActiveSearchFilters;
