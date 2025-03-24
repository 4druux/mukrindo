//component/product/CarDetails.jsx

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useProducts } from "@/context/ProductContext";
import { BsFuelPumpFill } from "react-icons/bs";
import { GiGearStickPattern } from "react-icons/gi";
import { FaRegCalendarAlt, FaRoad } from "react-icons/fa";
import { IoCarSportOutline } from "react-icons/io5";
import { RiCarLine } from "react-icons/ri";
import { BiCar } from "react-icons/bi";
import { TbEngine } from "react-icons/tb";
import { MdOutlineColorLens } from "react-icons/md";
import SkeletonCarDetails from "@/components/skeleton/SkeletonCarDetails";

const CarDetails = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchProductById } = useProducts();
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchProductById(productId);
        if (result.success) {
          setProduct(result.data);
        } else {
          setError(result.error);
        }
      } catch (error) {
        setError(error.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, fetchProductById]);

  if (loading) {
    return <SkeletonCarDetails />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Product not found.</p>
          <button
            onClick={() => router.back()}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex flex-col gap-4">
        {/* Image Gallery */}
        <div>
          <div className="relative w-full h-96 mb-4">
            <Image
              src={product.images[0]}
              alt={product.carName}
              layout="fill"
              objectFit="cover"
              className="rounded-2xl"
              priority
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {product.images.slice(1).map((image, index) => (
              <div key={index} className="relative w-full h-32">
                <Image
                  src={image}
                  alt={`${product.carName} - ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="p-6 rounded-3xl shadow-lg bg-white">
            <h1 className="text-2xl text-gray-700 mb-4">Detail Spesifikasi</h1>
          <h1 className="text-3xl font-bold mb-2">{product.carName}</h1>
          <p className="text-orange-500 font-semibold text-xl mb-4">
            Rp {product.price.toLocaleString("id-ID")}
          </p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div className="flex items-center space-x-2">
              <FaRoad className="text-gray-600" />
              <span className="text-gray-700">
                {product.travelDistance.toLocaleString("id-ID")} KM
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <GiGearStickPattern className="text-gray-600" />
              <span className="text-gray-700">{product.transmission}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BsFuelPumpFill className="text-gray-600" />
              <span className="text-gray-700">{product.fuelType}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaRegCalendarAlt className="text-gray-600" />
              <span className="text-gray-700">{product.plateNumber}</span>
            </div>
            <div className="flex items-center space-x-2">
              <IoCarSportOutline className="text-gray-600" />
              <span className="text-gray-700">{product.brand}</span>
            </div>
            <div className="flex items-center space-x-2">
              <RiCarLine className="text-gray-600" />
              <span className="text-gray-700">{product.model}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BiCar className="text-gray-600" />
              <span className="text-gray-700">{product.type}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TbEngine className="text-gray-600" />
              <span className="text-gray-700">{product.cc} CC</span>
            </div>
            <div className="flex items-center space-x-2">
              <MdOutlineColorLens className="text-gray-600" />
              <span className="text-gray-700">{product.carColor}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaRegCalendarAlt className="text-gray-600" />
              <span className="text-gray-700">
                Tahun Perakitan: {product.yearOfAssembly}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-700">
                STNK Expiry: {product.stnkExpiry}
              </span>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-8 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
