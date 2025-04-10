// layout/user/product/CarDetails.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProducts } from "@/context/ProductContext";

// Import Components
import BreadcrumbNav from "@/components/common/BreadcrumbNav";
import CarImage from "@/components/global/CarImage";
import CarProduct from "@/components/global/CarProduct";
import CarImageModal from "@/components/global/CarImageModal";
import CarPricingInfo from "@/components/product-user/beli-mobil/CarPricingInfo";

// Import Icon
import { ArrowLeft } from "lucide-react";

const CarDetails = ({ productId }) => {
  const router = useRouter();
  const { fetchProductById, incrementProductView } = useProducts();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalActiveIndex, setModalActiveIndex] = useState(0);

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
        setError(error.message || "Gagal memuat data produk.");
      } finally {
        setLoading(false);
      }
    };

    const incrementView = () => {
      console.log(
        `[EFFECT CarDetails] Incrementing view for product ID: ${productId}`
      );
      incrementProductView(productId).catch((err) => {
        console.warn("Gagal mencatat view:", err);
      });
    };

    if (productId) {
      fetchProduct();
      incrementView();
    }
  }, [productId, fetchProductById, incrementProductView]);

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
    return (
      <div className="flex items-center justify-center h-[80vh] bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  // Tampilan Error
  if (error || !product) {
    return (
      <div className="p-6 md:p-10 text-center text-red-600 h-[80vh] bg-gray-50 flex flex-col justify-center items-center">
        <p className="text-xl mb-4">
          {error || "Produk tidak ditemukan atau gagal dimuat."}
        </p>
        <button
          onClick={() => router.back("/")}
          className="flex items-center bg-orange-400 hover:bg-orange-500 text-white py-2 px-4 rounded-full mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-sm">Kembali</span>
        </button>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Beli Mobil", href: "/beli" },
    {
      label: product.brand,
      href: `/beli?search=${encodeURIComponent(product.brand)}`,
    },
    {
      label: product.model,
      href: `/beli?search=${encodeURIComponent(product.model)}`,
    },
    { label: product.carName, href: "" },
  ];

  return (
    <div className="pb-10">
      <BreadcrumbNav items={breadcrumbItems} />

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-3/5">
          <CarImage
            productId={product._id}
            images={product.images}
            carName={product.carName}
            isMobile={isMobile}
            onImageClick={openModal}
            isAdminRoute={false}
          />

          {/* Product Details*/}
          <div className="space-y-4 mt-4 lg:mt-8">
            <div className="block lg:hidden">
              <CarPricingInfo product={product} />
            </div>
            <CarProduct product={product} isAdminRoute={false} />
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 lg:sticky lg:top-24 self-start">
          <CarPricingInfo product={product} />
        </div>
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
