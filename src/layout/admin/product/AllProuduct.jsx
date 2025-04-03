// components/product/AllProducts.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import generateSlug from "@/utils/generateSlug";
import { BsFuelPumpFill } from "react-icons/bs";
import { GiGearStickPattern } from "react-icons/gi";
import { FaBoxOpen, FaEye, FaRegCalendarAlt, FaRoad } from "react-icons/fa";
import { Ellipsis, Plus, SquarePen, Trash2 } from "lucide-react";
import Pagination from "@/components/global/Pagination";
import { useProducts } from "@/context/ProductContext";
import SkeletonAllProduct from "@/components/skeleton/skeleton-admin/SkeletonAllProduct";
import CarImage from "@/components/product-user/home/CarImage";

const AllProducts = () => {
  const { products, loading, error, deleteProduct, updateProductStatus } =
    useProducts();
  const [isDropdownOpen, setIsDropdownOpen] = useState({});
  const dropdownRefs = useRef({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchQuery, setSearchQuery } = useSidebar();
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 12;
  useEffect(() => {
    const urlSearchQuery = searchParams.get("search");
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams, setSearchQuery]);
  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const result = await deleteProduct(productId);
      if (result.success) {
        alert("Product deleted successfully");
      } else {
        alert(result.error);
      }
    }
  };
  const handleStatusChange = async (productId, newStatus) => {
    const result = await updateProductStatus(productId, newStatus);
    if (result.success) {
      closeDropdown(productId);
    } else {
      alert(result.error);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRefs.current) {
        Object.keys(dropdownRefs.current).forEach((productId) => {
          if (
            dropdownRefs.current[productId] &&
            !dropdownRefs.current[productId].contains(event.target)
          ) {
            closeDropdown(productId);
          }
        });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const toggleDropdown = (productId) => {
    setIsDropdownOpen((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };
  const closeDropdown = (productId) => {
    setIsDropdownOpen((prev) => ({ ...prev, [productId]: false }));
  };
  const dropDownVariant = {
    open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.carName.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.model.toLowerCase().includes(query) ||
      (product.year ?? "").toString().includes(query) ||
      (product.price ?? "").toString().includes(query) ||
      product.plateNumber.toLowerCase().includes(query)
    );
  });
  const indexOfLastProduct = (currentPage + 1) * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const handlePageChange = (data) => {
    setCurrentPage(data.selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);
  // if (loading) {
  //   return <div className="text-center p-4">Loading...</div>; //REPLACE
  // }
  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }
  if (filteredProducts.length === 0 && !loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="flex gap-4">
          <FaBoxOpen className="w-36 h-36 mx-auto text-gray-700" />
          <div className="flex flex-col mt-10 text-gray-600">
            <p className="text-2xl">Oops!</p>
            <p>
              {searchQuery
                ? `No products match the search "${searchQuery}".`
                : "No products available."}
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4">
      <h1 className="mb-4 lg:mb-10 text-2xl font-medium">Produk Manajemen</h1>
      <button
        onClick={() => router.push("/admin/add-product")}
        className="flex items-center space-x-1 px-4 py-2 rounded-full bg-orange-100 hover:bg-orange-200 
        hover:shadow-xl cursor-pointer transition-colors"
      >
        <Plus className="text-orange-500 w-4 md:w-5" />
        <span className="text-xs md:text-sm mt-1 text-orange-500">
          Tambah Produk
        </span>
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {/* Conditionally render skeletons or actual products */}
        {loading
          ? Array(productsPerPage)
              .fill(null)
              .map((_, index) => <SkeletonAllProduct key={index} />)
          : currentProducts.map((product) => (
              <div
                key={product._id}
                className="rounded-2xl bg-white overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200 relative"
              >
                <Link
                  href={`/admin/car-details/${generateSlug(
                    product.carName,
                    product._id
                  )}`}
                >
                  <div>
                    <CarImage
                      images={product.images}
                      altText={product.carName}
                      status={product.status}
                      brand={product.brand}
                      model={product.model}
                      variant={product.variant}
                    />
                    <div className="p-4 mb-10">
                      <h2 className="text-md text-gray-800 line-clamp-1">
                        {product.carName}
                      </h2>
                      <p className="text-orange-500 font-medium text-lg mt-2">
                        Rp {product.price.toLocaleString("id-ID")}
                      </p>
                      <div className="flex justify-between py-3 border-b border-gray-300">
                        <div className="flex flex-col items-center space-y-1">
                          <FaRoad className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-600 text-xs">
                            {product.travelDistance.toLocaleString("id-ID")} KM
                          </span>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                          <GiGearStickPattern className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-600 text-xs">
                            {product.transmission}
                          </span>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                          <BsFuelPumpFill className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-600 text-xs">
                            {product.fuelType}
                          </span>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                          <FaRegCalendarAlt className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-600 text-xs">
                            {product.plateNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                <div
                  className="absolute top-2 right-2 z-10"
                  ref={(el) => (dropdownRefs.current[product._id] = el)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(product._id);
                    }}
                    className={`p-1 rounded-full border border-gray-100  bg-gray-100 hover:bg-orange-200 hover:border-orange-500 
                cursor-pointer group ${
                  isDropdownOpen[product._id]
                    ? "bg-orange-200 border-orange-500"
                    : ""
                }`}
                  >
                    <Ellipsis
                      className={`w-4 h-4 text-gray-700 group-hover:text-orange-600 ${
                        isDropdownOpen[product._id] ? "text-orange-600" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isDropdownOpen[product._id] && (
                      <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={dropDownVariant}
                        className="absolute right-0 mt-2 w-28 bg-white border border-gray-300 rounded-lg shadow-lg"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(product._id, "Tersedia");
                          }}
                          className="block w-full text-left text-xs px-4 py-2 text-gray-700 hover:text-gray-700 hover:bg-orange-100 rounded-lg cursor-pointer"
                        >
                          Tersedia
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(product._id, "Terjual");
                          }}
                          className="block w-full text-left text-xs px-4 py-2 text-gray-700 hover:text-gray-700 hover:bg-orange-100 rounded-lg cursor-pointer"
                        >
                          Terjual
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="absolute bottom-3 w-full">
                  <div className="flex justify-between items-center px-4 pt-1 md:pt-3 mt-1 md:mt-3">
                    <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                      <FaEye />
                      <span>Dilihat {product.viewCount || 0} kali</span>
                    </div>
                    <div className="flex md:space-x-2">
                      <Link
                        href={`/admin/edit-product/${generateSlug(
                          product.carName,
                          product._id
                        )}`}
                        className="p-2 rounded-full hover:bg-gray-100 hover:-translate-y-1 transition-all duration-500"
                      >
                        <SquarePen className="w-5 h-5 text-neutral-400" />
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product._id);
                        }}
                        className="p-2 rounded-full hover:bg-gray-100 hover:-translate-y-1 transition-all duration-500 cursor-pointer"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Only show pagination if not loading and there are products */}
      {!loading && currentProducts.length > 0 && (
        <Pagination
          pageCount={Math.ceil(filteredProducts.length / productsPerPage)}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
export default AllProducts;
