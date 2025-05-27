"use client";
import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import useSWR from "swr";
import isEqual from "lodash/isEqual";
import axiosInstance from "@/utils/axiosInstance";

const ProductContext = createContext();
const PRODUCTS_API_PATH = "/api/products";
export const useProducts = () => useContext(ProductContext);

const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

// const fetcher = async (url) => {
//   await new Promise((resolve) => setTimeout(resolve, 120000000));

//   const res = await axiosInstance.get(url);
//   return res.data;
// };

export const ProductProvider = ({ children }) => {
  const {
    data: productsData,
    error: swrError,
    isLoading: swrLoading,
    mutate,
  } = useSWR(PRODUCTS_API_PATH, fetcher, {
    revalidateOnFocus: true,
    // refreshInterval: 30000, // Jika Anda menggunakan ini, pertimbangkan dampaknya

    compare: (a, b) => {
      if (a === b) return true;

      if (a === undefined || b === undefined) return false;

      return isEqual(a, b);
    },
  });

  const products = productsData || [];
  const loading = swrLoading;
  const error = swrError
    ? swrError.response?.data?.message ||
      swrError.message ||
      "Gagal memuat produk."
    : null;

  const [bookmarks, setBookmarks] = useState(new Set());

  const deleteProduct = async (productId) => {
    try {
      await axiosInstance.delete(`${PRODUCTS_API_PATH}/${productId}`);
      mutate();
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete product";
      console.error("Delete Product Error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateProductStatus = async (productId, newStatus) => {
    try {
      await axiosInstance.put(`${PRODUCTS_API_PATH}/${productId}`, {
        status: newStatus,
      });
      mutate();
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update status";
      console.error("Update Status Error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const fetchProductById = useCallback(async (productId) => {
    try {
      const response = await axiosInstance.get(
        `${PRODUCTS_API_PATH}/${productId}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch product";
      console.error("Fetch By ID Error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const incrementProductView = useCallback(
    async (productId) => {
      if (typeof window === "undefined" || !productId) {
        return {
          success: false,
          error: "Invalid operation environment or missing product ID.",
        };
      }

      const today = new Date().toISOString().split("T")[0];
      const localStorageKey = `viewedProduct_${productId}_${today}`;

      if (localStorage.getItem(localStorageKey)) {
        return { success: true, message: "Already viewed today." };
      }

      try {
        const response = await axiosInstance.put(
          `${PRODUCTS_API_PATH}/${productId}/increment-view`
        );

        localStorage.setItem(localStorageKey, "true");

        mutate((currentData) => {
          if (!currentData) return currentData;
          return currentData.map((p) =>
            p._id === productId
              ? { ...p, viewCount: response.data.viewCount }
              : p
          );
        }, false);

        return { success: true, viewCount: response.data.viewCount };
      } catch (err) {
        console.error("Failed to increment product view count:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Gagal mencatat view produk";
        return { success: false, error: errorMessage };
      }
    },
    [mutate]
  );

  useEffect(() => {
    const storedBookmarks = localStorage.getItem("bookmarks");
    if (storedBookmarks) {
      try {
        const parsedBookmarks = JSON.parse(storedBookmarks);
        if (Array.isArray(parsedBookmarks)) {
          setBookmarks(new Set(parsedBookmarks));
        } else {
          console.warn("Format bookmark tersimpan tidak valid. Mereset.");
          localStorage.removeItem("bookmarks");
        }
      } catch (error) {
        console.error("Error parsing bookmarks dari localStorage:", error);
        localStorage.removeItem("bookmarks");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(Array.from(bookmarks)));
  }, [bookmarks]);

  const toggleBookmark = (productId) => {
    setBookmarks((prevBookmarks) => {
      const newBookmarks = new Set(prevBookmarks);
      if (newBookmarks.has(productId)) {
        newBookmarks.delete(productId);
      } else {
        newBookmarks.add(productId);
      }
      return newBookmarks;
    });
  };

  const isBookmarked = (productId) => bookmarks.has(productId);

  const contextValue = {
    products,
    loading,
    error,
    mutateProducts: mutate,
    deleteProduct,
    updateProductStatus,
    fetchProductById,
    incrementProductView,
    bookmarks,
    bookmarkCount: bookmarks.size,
    toggleBookmark,
    isBookmarked,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};
