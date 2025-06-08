// layout/admin/product/CarDetails.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProducts } from "@/context/ProductContext";

// Import Components
import SkeletonCarDetails from "@/components/skeleton/skeleton-admin/SkeletonCarDetails";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import CarImage from "@/components/global/CarImage";
import CarProduct from "@/components/global/CarProduct";
import CarImageModal from "@/components/global/CarImageModal";
import ButtonMagnetic from "@/components/common/ButtonMagnetic";
import { IoArrowBack } from "react-icons/io5";

const CarDetails = ({ productId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { fetchProductById } = useProducts();
  const router = useRouter();
  const [product, setProduct] = useState(null);

  //Modal Img
  const [showModal, setShowModal] = useState(false);
  const [modalActiveIndex, setModalActiveIndex] = useState(0);

  const openModal = (index) => {
    setModalActiveIndex(index);
    setShowModal(true);
  };

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const closeModal = () => {
    setShowModal(false);
  };

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

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  if (loading) {
    return <SkeletonCarDetails />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <ButtonMagnetic
            onClick={() => router.back("/admin")}
            icon={<IoArrowBack className="w-5 h-5" />}
          >
            Kembali
          </ButtonMagnetic>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Produk tidak ditemukan.</p>
          <ButtonMagnetic
            onClick={() => router.back("/admin")}
            icon={<IoArrowBack className="w-5 h-5" />}
          >
            Kembali
          </ButtonMagnetic>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Beranda", href: "/admin" },
    { label: "Katalog Produk", href: "/admin/produk" },
    { label: product.carName, href: "" },
  ];

  return (
    <div className="">
      <BreadcrumbNav items={breadcrumbItems} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <CarImage
          product={product}
          isMobile={isMobile}
          onImageClick={openModal}
          isAdminRoute={true}
        />

        {/* Product Details*/}
        <CarProduct product={product} isAdminRoute={true} />
      </div>

      {/* Modal */}
      <CarImageModal
        show={showModal}
        images={product.images}
        carName={product.carName}
        initialIndex={modalActiveIndex}
        isMobile={isMobile}
        onClose={closeModal}
      />
    </div>
  );
};

export default CarDetails;
