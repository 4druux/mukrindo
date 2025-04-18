// export in AllProuduct, CarShop, useFilterAndSuggest

// components/global/ShortProduct.jsx
import ScrollHorizontal from "../common/ScrollHorizontal";

export const SHORT_BY = {
  RECOMMENDATION: "recommendation",
  LATEST: "latest",
  YEAR_DESC: "year_desc",
  PRICE_ASC: "price_asc",
  PRICE_UNDER_150: "price_under_150",
  PRICE_BETWEEN_150_300: "price_between_150_300",
  PRICE_OVER_300: "price_over_300",
};

const filterLabels = {
  [SHORT_BY.RECOMMENDATION]: "Rekomendasi",
  [SHORT_BY.LATEST]: "Mobil Terbaru",
  [SHORT_BY.YEAR_DESC]: "Tahun Terbaru",
  [SHORT_BY.PRICE_ASC]: "Harga Terendah",
  [SHORT_BY.PRICE_UNDER_150]: "Dibawah 150 Juta",
  [SHORT_BY.PRICE_BETWEEN_150_300]: "150 - 300 Juta",
  [SHORT_BY.PRICE_OVER_300]: "Diatas 300 Juta",
};

const ShortProduct = ({
  activeFilter,
  setActiveFilter,
  excludeFilters = [],
  isAdminRoute = false,
}) => {
  const getButtonClass = (filterType) => {
    return `flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
      activeFilter === filterType
        ? "bg-orange-100 text-orange-500 border border-orange-500"
        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
    }`;
  };

  const filtersToShow = Object.entries(SHORT_BY).filter(
    ([key, value]) => !excludeFilters.includes(value)
  );

  return (
    <>
      <div className="mb-4">
        <ScrollHorizontal
          className={`space-x-2 ${isAdminRoute ? "" : "lg:px-2"}`}
          buttonVerticalAlign="top"
        >
          {filtersToShow.map(([key, filterType]) => (
            <button
              key={filterType}
              onClick={() => setActiveFilter(filterType)}
              className={getButtonClass(filterType)}
            >
              {filterLabels[filterType]}
            </button>
          ))}
        </ScrollHorizontal>
      </div>
    </>
  );
};

export default ShortProduct;
