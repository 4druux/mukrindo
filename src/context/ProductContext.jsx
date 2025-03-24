// context/ProductContext.jsx
"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/products");
      setProducts(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch products"
      );
    } finally {
      setLoading(false);
    }
  }, [refetchTrigger]);

  // Fetch Product by ID
  const fetchProductById = useCallback(async (productId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/products/${productId}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch product";
      return { success: false, error: errorMessage };
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const refetchProducts = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`);
      refetchProducts();
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete product";
      return { success: false, error: errorMessage };
    }
  };

  const updateProductStatus = async (productId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/products/${productId}`, {
        status: newStatus,
      });
      refetchProducts();
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update status";
      return { success: false, error: errorMessage };
    }
  };

  const contextValue = {
    products,
    loading,
    error,
    fetchProducts,
    refetchProducts,
    deleteProduct,
    updateProductStatus,
    fetchProductById,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};
