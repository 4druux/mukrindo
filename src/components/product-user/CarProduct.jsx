// src/components/product-user/CarProduct.jsx
import React from "react";
import Link from "next/link";
import SkeletonAllProduct from "@/components/skeleton/SkeletonAllProduct";
import generateSlug from "@/utils/generateSlug";
import { BsFuelPumpFill } from "react-icons/bs";
import { FaRegCalendarAlt, FaRoad } from "react-icons/fa";
import { GiGearStickPattern } from "react-icons/gi";
import { MdOutlineColorLens } from "react-icons/md";
import CarImage from "@/components/product-user/CarImage";

const CarProduct = ({
  products,
  loading,
  error,
  onProductClick,
  skeletonCount = 6,
  emptyMessage = "Tidak ada produk mobil yang ditemukan.",
}) => {
  if (error) {
    // Handle error state pada layout product
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {loading
        ? Array(skeletonCount)
            .fill(null)
            .map((_, index) => <SkeletonAllProduct key={index} />)
        : products.map((product) => (
            <div
              key={product._id}
              className="rounded-2xl bg-white overflow-hidden transition-shadow duration-200 relative shadow-md hover:shadow-xl"
              onClick={() => onProductClick(product)}
            >
              <Link
                href={`/car-details/${generateSlug(
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

                  <div className="p-6">
                    <div className="flex flex-col border-b border-gray-300 pb-2">
                      <h2
                        className="text-md text-gray-800 truncate"
                        title={product.carName}
                      >
                        {product.carName}
                      </h2>
                      <p className="text-orange-500 font-medium text-lg mt-2">
                        Rp {product.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex justify-between py-3 mt-2">
                      {/* Detail Spesifikasi Mobil */}
                      <div className="flex flex-col items-center space-y-1 text-center">
                        <FaRoad className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-600 text-xs">
                          {product.travelDistance.toLocaleString("id-ID")} KM
                        </span>
                      </div>
                      <div className="flex flex-col items-center space-y-1 text-center">
                        <GiGearStickPattern className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-600 text-xs">
                          {product.transmission}
                        </span>
                      </div>
                      <div className="flex flex-col items-center space-y-1 text-center">
                        <BsFuelPumpFill className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-600 text-xs">
                          {product.fuelType}
                        </span>
                      </div>
                      <div className="flex flex-col items-center space-y-1 text-center">
                        <FaRegCalendarAlt className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-600 text-xs">
                          {product.plateNumber}
                        </span>
                      </div>
                      <div className="flex flex-col items-center space-y-1 text-center">
                        <MdOutlineColorLens className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-600 text-xs">
                          {product.carColor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}

      {!loading && products.length === 0 && (
        <div className="col-span-full text-center text-gray-500 mt-4">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export default CarProduct;
