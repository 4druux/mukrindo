// components/product/AllProducts.jsx
"use client";
import { useState, useEffect, useRef } from "react"; // Tambahkan useRef
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import generateSlug from "@/utils/generateSlug";
import { Ellipsis, Plus, SquarePen, Trash2 } from "lucide-react";
import { BsFuelPumpFill } from "react-icons/bs";
import { GiGearStickPattern } from "react-icons/gi";
import { FaRegCalendarAlt, FaRoad } from "react-icons/fa";
import { useRouter } from "next/navigation";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState({});
  const dropdownRefs = useRef({});
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        if (!response.ok) {
          throw new Error("Gagal mengambil data produk");
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/products/${productId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Gagal menghapus produk. Silakan coba lagi."
          );
        }
        // Update state setelah berhasil menghapus
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== productId)
        );
        alert("Produk berhasil dihapus");
      } catch (error) {
        console.error("Error:", error);
        alert(error.message);
      }
    }
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Gagal mengubah status. Silakan coba lagi."
        );
      }

      // Update state setelah berhasil mengubah status
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId
            ? { ...product, status: newStatus }
            : product
        )
      );
      closeDropdown(productId); // Tutup dropdown setelah update
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  };

  // Event listener untuk klik di luar dropdown
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

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }
  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }
  if (products.length === 0) {
    return <div className="text-center p-4">Tidak ada produk.</div>;
  }

  return (
    <div className="">
      <h1 className="sm:mb-12 mb-4 text-2xl font-medium">Product Management</h1>

      <button
        onClick={() => router.push("/admin/add-product")}
        className="flex items-center space-x-1 px-4 py-2 rounded-full bg-orange-100 hover:bg-orange-200 
        hover:shadow-xl cursor-pointer transition-colors"
      >
        <Plus className="text-orange-500 w-4 md:w-5" />
        <span className="text-xs md:text-sm mt-1 text-orange-500">
          Add Product
        </span>
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 relative"
          >
            {/* Sold Out Banner */}
            {product.status === "sold out" && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <img
                  src="./images/soldout.png"
                  alt="Sold Out"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%]"
                />
              </div>
            )}

            {/* Image Container (dengan overlay) */}
            <div className="relative w-full h-40">
              <Image
                src={product.images[0]}
                alt={product.carName}
                layout="fill"
                objectFit="cover"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                className={`object-cover ${
                  product.status === "sold out" ? "opacity-40" : ""
                }`}
              />

              {/* Dropdown */}
              <div
                className="absolute top-2 right-2 z-10"
                ref={(el) => (dropdownRefs.current[product._id] = el)}
              >
                <button
                  onClick={() => toggleDropdown(product._id)}
                  className={`p-1 rounded-full border border-gray-200  bg-gray-200 hover:bg-orange-200 hover:border-orange-500 
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
                        onClick={() =>
                          handleStatusChange(product._id, "available")
                        }
                        className="block w-full text-left text-xs px-4 py-2 text-gray-700 hover:text-gray-700 hover:bg-orange-100 rounded-lg cursor-pointer"
                      >
                        Available
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(product._id, "sold out")
                        }
                        className="block w-full text-left text-xs px-4 py-2 text-gray-700 hover:text-gray-700 hover:bg-orange-100 rounded-lg cursor-pointer"
                      >
                        Sold Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Product Info */}
            <div
              className={`p-4  ${
                product.status === "sold out" ? "opacity-40" : ""
              }`}
            >
              <h2 className="text-md text-gray-800">
                <Link href={`/products/${product._id}`}>{product.carName}</Link>
              </h2>
              <p className="text-orange-500 font-medium text-lg mt-2">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
              <div className="flex justify-between py-3">
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

              {/* Action Buttons */}
              <div className="flex justify-end items-center border-t border-gray-300 pt-1 md:pt-3 mt-1 md:mt-3">
                <div className="flex md:space-x-2">
                  <Link
                    href={`/products/${product._id}`}
                    className="p-2 rounded-full hover:bg-gray-100 hover:-translate-y-1 transition-all duration-500"
                  >
                    <Ellipsis className="w-5 h-5 text-orange-500" />
                  </Link>
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
                    onClick={() => handleDelete(product._id)}
                    className="p-2 rounded-full hover:bg-gray-100 hover:-translate-y-1 transition-all duration-500"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllProducts;
