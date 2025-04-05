// src/hooks/useFilterAndSuggest.js
import { useState, useMemo, useEffect } from "react";
import levenshtein from "js-levenshtein";
import { ALL_FILTER_TYPES } from "@/components/global/AllFilter";

const PRICE_LOWER_BOUND = 150000000;
const PRICE_UPPER_BOUND = 300000000;

const defaultOptions = {
  searchFields: ["carName", "brand", "model", "year", "price"],
  suggestionTargets: ["brand", "model", "carName"],
  recentlyViewed: [],
};

export const useFilterAndSuggest = ({
  initialProducts = [],
  searchQuery = "",
  initialFilter = ALL_FILTER_TYPES.LATEST,
  options = {},
  isLoading = false,
}) => {
  const mergedOptions = { ...defaultOptions, ...options };
  const { searchFields, suggestionTargets, recentlyViewed } = mergedOptions;

  const [activeFilter, setActiveFilter] = useState(initialFilter);

  useEffect(() => {
    setActiveFilter(initialFilter);
  }, [initialFilter]);

  const processedProducts = useMemo(() => {
    const productsToProcess = initialProducts || [];
    if (!productsToProcess || productsToProcess.length === 0) {
      return [];
    }

    let tempProducts = [...productsToProcess];
    const queryLower = searchQuery.toLowerCase().trim();

    if (queryLower) {
      tempProducts = tempProducts.filter((product) => {
        return searchFields.some((field) => {
          const value = product[field];
          const valueString =
            value !== null && value !== undefined
              ? String(value).toLowerCase()
              : "";
          return valueString.includes(queryLower);
        });
      });
    }

    // 2. Filter berdasarkan Filter Harga Aktif
    switch (activeFilter) {
      case ALL_FILTER_TYPES.PRICE_UNDER_150:
        tempProducts = tempProducts.filter((p) => p.price < PRICE_LOWER_BOUND);
        break;
      case ALL_FILTER_TYPES.PRICE_BETWEEN_150_300:
        tempProducts = tempProducts.filter(
          (p) => p.price >= PRICE_LOWER_BOUND && p.price <= PRICE_UPPER_BOUND
        );
        break;
      case ALL_FILTER_TYPES.PRICE_OVER_300:
        tempProducts = tempProducts.filter((p) => p.price > PRICE_UPPER_BOUND);
        break;
    }

    // 3. Sorting berdasarkan Filter Aktif
    let sortedAndFilteredProducts = [...tempProducts];
    switch (activeFilter) {
      case ALL_FILTER_TYPES.LATEST:
        sortedAndFilteredProducts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case ALL_FILTER_TYPES.PRICE_ASC:
        sortedAndFilteredProducts.sort(
          (a, b) => (a.price || 0) - (b.price || 0)
        );
        break;
      case ALL_FILTER_TYPES.YEAR_DESC:
        sortedAndFilteredProducts.sort(
          (a, b) =>
            (b.yearOfAssembly || 0) - (a.yearOfAssembly || 0) ||
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case ALL_FILTER_TYPES.RECOMMENDATION:
        if (recentlyViewed && recentlyViewed.length > 0) {
          const viewedBrands = new Set(
            recentlyViewed.map((item) => item.brand?.toLowerCase())
          );
          const viewedModels = new Set(
            recentlyViewed.map(
              (item) =>
                `${item.brand?.toLowerCase()}-${item.model?.toLowerCase()}`
            )
          );
          sortedAndFilteredProducts.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;
            const modelA = `${a.brand?.toLowerCase()}-${a.model?.toLowerCase()}`;
            const modelB = `${b.brand?.toLowerCase()}-${b.model?.toLowerCase()}`;

            if (viewedModels.has(modelA)) scoreA += 2;
            else if (viewedBrands.has(a.brand?.toLowerCase())) scoreA += 1;

            if (viewedModels.has(modelB)) scoreB += 2;
            else if (viewedBrands.has(b.brand?.toLowerCase())) scoreB += 1;

            if (scoreB !== scoreA) return scoreB - scoreA;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
        } else {
          sortedAndFilteredProducts.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        }
        break;
      case ALL_FILTER_TYPES.PRICE_UNDER_150:
      case ALL_FILTER_TYPES.PRICE_BETWEEN_150_300:
      case ALL_FILTER_TYPES.PRICE_OVER_300:
      default:
        sortedAndFilteredProducts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
    }

    return sortedAndFilteredProducts;
  }, [
    initialProducts,
    searchQuery,
    activeFilter,
    recentlyViewed,
    searchFields,
  ]);

  const suggestedQuery = useMemo(() => {
    const productsSource = initialProducts || [];
    if (
      isLoading ||
      processedProducts.length > 0 ||
      !searchQuery ||
      !productsSource ||
      productsSource.length === 0
    ) {
      return null;
    }

    const queryLower = searchQuery.toLowerCase();
    let bestSuggestion = null;
    let minDistance = Infinity;
    const threshold = Math.max(1, Math.floor(queryLower.length / 3));

    const targets = new Set();
    productsSource.forEach((p) => {
      suggestionTargets.forEach((field) => {
        if (p[field]) targets.add(String(p[field]));
      });
      if (
        suggestionTargets.includes("brand") &&
        suggestionTargets.includes("model") &&
        p.brand &&
        p.model
      ) {
        targets.add(`${p.brand} ${p.model}`);
      }
    });

    targets.forEach((target) => {
      if (!target) return;
      const targetLower = target.toLowerCase();
      if (targetLower === queryLower) return;
      const distance = levenshtein(queryLower, targetLower);

      if (distance < minDistance && distance <= threshold) {
        minDistance = distance;
        bestSuggestion = target;
      } else if (distance === minDistance && distance <= threshold) {
        if (target.length < (bestSuggestion?.length || Infinity)) {
          bestSuggestion = target;
        }
      }
    });

    if (bestSuggestion?.toLowerCase() === queryLower) {
      return null;
    }

    return bestSuggestion;
  }, [
    isLoading,
    processedProducts,
    searchQuery,
    initialProducts,
    suggestionTargets,
  ]);

  return {
    processedProducts,
    suggestedQuery,
    activeFilter,
    setActiveFilter,
  };
};
