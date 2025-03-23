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
  const [refetchTrigger, setRefetchTrigger] = useState(0); // Add a trigger

  // Fetch Products (now depends on refetchTrigger)
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

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Function to trigger a refetch
  const refetchProducts = () => {
    setRefetchTrigger((prev) => prev + 1); // Increment the trigger
  };

  // Delete Product
  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`);
      // No need to manually update state, refetch will handle it
      refetchProducts(); // Refetch after deletion
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete product";
      return { success: false, error: errorMessage };
    }
  };

  // Update Product Status
  const updateProductStatus = async (productId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/products/${productId}`, {
        status: newStatus,
      });
      // No need to manually update state, refetch will handle it
      refetchProducts(); // Refetch after status update
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
    fetchProducts, // Keep this for initial fetch
    refetchProducts, // Expose the refetch function
    deleteProduct,
    updateProductStatus,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};
