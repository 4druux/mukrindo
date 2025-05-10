"use client";
import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import axios from "axios";
import useSWR from "swr";
import isEqual from "lodash/isEqual";

const ProductContext = createContext();
export const useProducts = () => useContext(ProductContext);

const fetcher = (url) => axios.get(url).then((res) => res.data);
const API_ENDPOINT = "http://localhost:5000/api/products";

export const ProductProvider = ({ children }) => {
  const {
    data,
    error: swrError,
    isLoading: swrLoading,
    mutate,
  } = useSWR(API_ENDPOINT, fetcher, {
    revalidateOnFocus: true,
    // refreshInterval: 30000, // Jika Anda menggunakan ini, pertimbangkan dampaknya

    compare: (a, b) => {
      if (a === b) return true;

      if (a === undefined || b === undefined) return false;

      return isEqual(a, b);
    },
  });

  const products = data || [];
  const loading = swrLoading;
  const error = swrError;

  const [bookmarks, setBookmarks] = useState(new Set());

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`${API_ENDPOINT}/${productId}`);
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
      await axios.put(`${API_ENDPOINT}/${productId}`, {
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
      const response = await axios.get(`${API_ENDPOINT}/${productId}`);
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

  const incrementProductView = useCallback(async (productId) => {
    try {
      await axios.put(`${API_ENDPOINT}/${productId}/increment-view`);

      return { success: true };
    } catch (error) {
      console.error("Failed to increment view count:", error);
      return { success: false, error: "Failed to increment view count" };
    }
  }, []);

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
