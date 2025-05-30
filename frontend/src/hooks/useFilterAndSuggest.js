// frontend/src/hooks/useFilterAndSuggest.js
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import levenshtein from "js-levenshtein"; //
import { SHORT_BY } from "@/components/global/ShortProduct"; //

const PRICE_LOWER_BOUND = 150000000; //
const PRICE_UPPER_BOUND = 300000000; //

const defaultOptions = {
  //
  searchFields: [
    //
    "carName",
    "brand",
    "model",
    "year",
    "price",
    "plateNumber",
    "variant",
    "transmission",
    "fuelType",
    "type",
  ],
  suggestionTargets: ["brand", "model", "carName"], //
  recentlyViewed: [], //
  defaultSort: SHORT_BY.RECOMMENDATION, //
};

export const useFilterAndSuggest = ({
  initialProducts = [], //
  searchQuery = "", //
  initialFilter = SHORT_BY.LATEST,
  options = {}, //
  isLoading = false, //
}) => {
  const mergedOptions = useMemo(
    () => ({ ...defaultOptions, ...options }),
    [options]
  ); //
  const { searchFields, suggestionTargets, recentlyViewed, defaultSort } =
    mergedOptions; //
  const searchParams = useSearchParams(); //

  const activeFilter = useMemo(() => {
    //
    const sortParam = searchParams.get("sort"); //
    const sortMap = {
      //
      [SHORT_BY.LATEST]: SHORT_BY.LATEST, //
      [SHORT_BY.PRICE_ASC]: SHORT_BY.PRICE_ASC, //
      [SHORT_BY.YEAR_DESC]: SHORT_BY.YEAR_DESC, //
      [SHORT_BY.RECOMMENDATION]: SHORT_BY.RECOMMENDATION, //
      [SHORT_BY.PRICE_UNDER_150]: SHORT_BY.PRICE_UNDER_150, //
      [SHORT_BY.PRICE_BETWEEN_150_300]: SHORT_BY.PRICE_BETWEEN_150_300, //
      [SHORT_BY.PRICE_OVER_300]: SHORT_BY.PRICE_OVER_300, //
    };
    return sortMap[sortParam] || defaultSort; //
  }, [searchParams, defaultSort]);

  const setActiveFilter = (newFilterValue) => {
    //
    const currentParams = new URLSearchParams(searchParams.toString()); //
    currentParams.set("sort", newFilterValue); //

    console.warn(
      "setActiveFilter in useFilterAndSuggest should ideally trigger URL change from the component"
    );
  };

  const processedProducts = useMemo(() => {
    //
    const productsToProcess = initialProducts || []; //
    if (!productsToProcess || productsToProcess.length === 0) {
      //
      return []; //
    }

    let tempProducts = [...productsToProcess]; //

    // 1. Filter berdasarkan Search Query (dari input search utama)
    const queryLower = searchQuery.toLowerCase().trim(); //
    if (queryLower) {
      //
      const queryTokens = queryLower
        .split(/\s+/)
        .filter((token) => token.length > 0);
      tempProducts = tempProducts.filter((product) => {
        //
        const brandLower = product.brand?.toLowerCase() || "";
        const modelLower = product.model?.toLowerCase() || "";
        const carNameLower = product.carName?.toLowerCase() || "";
        const variantLower = product.variant?.toLowerCase() || "";
        const yearString =
          product.yearOfAssembly?.toString() || product.year?.toString() || "";
        const typeLower = product.type?.toLowerCase() || "";
        const transmissionLower = product.transmission?.toLowerCase() || "";
        const fuelTypeLower = product.fuelType?.toLowerCase() || "";

        // Mencoba mencocokkan setiap token dari kueri dengan kombinasi field relevan
        // Ini adalah pendekatan sederhana; bisa dipercanggih dengan bobot atau logika AND/OR yang lebih kompleks
        return queryTokens.every((token) => {
          return (
            brandLower.includes(token) ||
            modelLower.includes(token) ||
            carNameLower.includes(token) ||
            variantLower.includes(token) ||
            yearString.includes(token) ||
            typeLower.includes(token) ||
            transmissionLower.includes(token) ||
            fuelTypeLower.includes(token)
          );
        });
      });
    }

    // 2. Filter berdasarkan URL Parameters (dari SearchFilters)
    const brandFilter = searchParams.get("brand"); //
    const modelFilter = searchParams.get("model"); //
    const typeFilter = searchParams.get("type"); //
    const transmissionFilter = searchParams.get("transmission");
    const fuelTypeFilter = searchParams.get("fuelType"); //
    const yearMinFilter = searchParams.get("yearMin"); //
    const yearMaxFilter = searchParams.get("yearMax"); //
    const priceMinFilter = searchParams.get("priceMin"); //
    const priceMaxFilter = searchParams.get("priceMax"); //

    if (brandFilter) {
      //
      tempProducts = tempProducts.filter(
        (p) => p.brand?.toLowerCase() === brandFilter.toLowerCase() //
      );
    }
    if (modelFilter) {
      //
      tempProducts = tempProducts.filter(
        (p) => p.model?.toLowerCase() === modelFilter.toLowerCase() //
      );
    }
    if (typeFilter) {
      //
      tempProducts = tempProducts.filter(
        (p) => p.type?.toLowerCase() === typeFilter.toLowerCase() //
      );
    }
    if (transmissionFilter) {
      tempProducts = tempProducts.filter(
        (p) =>
          p.transmission?.toLowerCase() === transmissionFilter.toLowerCase()
      );
    }
    if (fuelTypeFilter) {
      //
      tempProducts = tempProducts.filter(
        (p) => p.fuelType?.toLowerCase() === fuelTypeFilter.toLowerCase() //
      );
    }
    if (yearMinFilter && !isNaN(parseInt(yearMinFilter))) {
      //
      tempProducts = tempProducts.filter(
        (p) => (p.yearOfAssembly || p.year) >= parseInt(yearMinFilter) //
      );
    }
    if (yearMaxFilter && !isNaN(parseInt(yearMaxFilter))) {
      //
      tempProducts = tempProducts.filter(
        (p) => (p.yearOfAssembly || p.year) <= parseInt(yearMaxFilter) //
      );
    }
    const numPriceMin = priceMinFilter ? Number(priceMinFilter) : null; //
    const numPriceMax = priceMaxFilter ? Number(priceMaxFilter) : null; //

    if (numPriceMin !== null && !isNaN(numPriceMin)) {
      //
      tempProducts = tempProducts.filter((p) => p.price >= numPriceMin); //
    }
    if (numPriceMax !== null && !isNaN(numPriceMax)) {
      //
      tempProducts = tempProducts.filter((p) => p.price <= numPriceMax); //
    }

    // 3. Filter berdasarkan Filter Harga Aktif (dari ShortProduct)
    switch (
      activeFilter //
    ) {
      case SHORT_BY.PRICE_UNDER_150: //
        tempProducts = tempProducts.filter((p) => p.price < PRICE_LOWER_BOUND); //
        break;
      case SHORT_BY.PRICE_BETWEEN_150_300: //
        tempProducts = tempProducts.filter(
          (p) => p.price >= PRICE_LOWER_BOUND && p.price <= PRICE_UPPER_BOUND //
        );
        break;
      case SHORT_BY.PRICE_OVER_300: //
        tempProducts = tempProducts.filter((p) => p.price > PRICE_UPPER_BOUND); //
        break;
    }

    // 4. Sorting berdasarkan Filter Aktif (dari ShortProduct)
    let sortedAndFilteredProducts = [...tempProducts]; //
    switch (
      activeFilter //
    ) {
      case SHORT_BY.LATEST: //
        sortedAndFilteredProducts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt) //
        );
        break;
      case SHORT_BY.PRICE_ASC: //
        sortedAndFilteredProducts.sort(
          (a, b) => (a.price || 0) - (b.price || 0) //
        );
        break;
      case SHORT_BY.YEAR_DESC: //
        sortedAndFilteredProducts.sort(
          (a, b) =>
            (b.yearOfAssembly || b.year || 0) - //
              (a.yearOfAssembly || a.year || 0) || //
            new Date(b.createdAt) - new Date(a.createdAt) //
        );
        break;
      case SHORT_BY.RECOMMENDATION: //
        if (recentlyViewed && recentlyViewed.length > 0) {
          //
          const viewedBrands = new Set( //
            recentlyViewed.map((item) => item.brand?.toLowerCase()) //
          );
          const viewedModels = new Set( //
            recentlyViewed.map(
              (item) =>
                `${item.brand?.toLowerCase()}-${item.model?.toLowerCase()}` //
            )
          );
          sortedAndFilteredProducts.sort((a, b) => {
            //
            let scoreA = 0; //
            let scoreB = 0; //
            const modelA = `${a.brand?.toLowerCase()}-${a.model?.toLowerCase()}`; //
            const modelB = `${b.brand?.toLowerCase()}-${b.model?.toLowerCase()}`; //
            if (viewedModels.has(modelA)) scoreA += 2; //
            else if (viewedBrands.has(a.brand?.toLowerCase())) scoreA += 1; //
            if (viewedModels.has(modelB)) scoreB += 2; //
            else if (viewedBrands.has(b.brand?.toLowerCase())) scoreB += 1; //
            if (scoreB !== scoreA) return scoreB - scoreA; //
            return new Date(b.createdAt) - new Date(a.createdAt); //
          });
        } else {
          sortedAndFilteredProducts.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt) //
          );
        }
        break;
      case SHORT_BY.PRICE_UNDER_150: //
      case SHORT_BY.PRICE_BETWEEN_150_300: //
      case SHORT_BY.PRICE_OVER_300: //
      default:
        sortedAndFilteredProducts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt) //
        );
        break;
    }

    return sortedAndFilteredProducts; //
  }, [
    initialProducts,
    searchQuery,
    activeFilter,
    recentlyViewed,
    searchParams,
  ]);

  const suggestedQuery = useMemo(() => {
    //
    const productsSource = initialProducts || []; //
    if (
      isLoading || //
      processedProducts.length > 0 ||
      !searchQuery || //
      !productsSource || //
      productsSource.length === 0 //
    ) {
      return null; //
    }
    const queryLower = searchQuery.toLowerCase(); //
    let bestSuggestion = null; //
    let minDistance = Infinity; //
    const threshold = Math.max(1, Math.floor(queryLower.length / 3)); //
    const targets = new Set(); //
    productsSource.forEach((p) => {
      //
      suggestionTargets.forEach((field) => {
        //
        if (p[field]) targets.add(String(p[field])); //
      });
      if (
        suggestionTargets.includes("brand") && //
        suggestionTargets.includes("model") && //
        p.brand && //
        p.model //
      ) {
        targets.add(`${p.brand} ${p.model}`); //
      }
    });
    targets.forEach((target) => {
      //
      if (!target) return; //
      const targetLower = target.toLowerCase(); //
      if (targetLower === queryLower) return; //
      const distance = levenshtein(queryLower, targetLower); //
      if (distance < minDistance && distance <= threshold) {
        //
        minDistance = distance; //
        bestSuggestion = target; //
      } else if (distance === minDistance && distance <= threshold) {
        //
        if (target.length < (bestSuggestion?.length || Infinity)) {
          //
          bestSuggestion = target; //
        }
      }
    });
    if (bestSuggestion?.toLowerCase() === queryLower) {
      //
      return null; //
    }
    return bestSuggestion; //
  }, [
    isLoading, //
    processedProducts.length, //
    searchQuery, //
    initialProducts, //
    suggestionTargets, //
  ]);

  return {
    //
    processedProducts, //
    suggestedQuery, //
    activeFilter, //
    setActiveFilter, //
  };
};
