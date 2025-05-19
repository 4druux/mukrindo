// layout/user/product/BuyCarDetails.jsx
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
import { ArrowLeft, Loader2 } from "lucide-react";

const BuyCarDetails = ({ productId }) => {
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
      // console.log(
      //   `[EFFECT BuyCarDetails] Incrementing view for product ID: ${productId}`
      // );
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
      setIsMobile(window.innerWidth <= 760);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[90vh] bg-gray asdadsa-50">
        <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
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
    <div>
      <BreadcrumbNav items={breadcrumbItems} />

      <div className="flex flex-col xl:flex-row gap-4">
        <div className="xl:w-3/5">
          <CarImage
            productId={product._id}
            product={product}
            images={product.images}
            isMobile={isMobile}
            onImageClick={openModal}
            isAdminRoute={false}
          />
        </div>
        <div className="w-full xl:w-1/2">
          <CarPricingInfo product={product} />
        </div>
      </div>

      <div className="mt-4 xl:mt-8">
        <CarProduct product={product} isAdminRoute={false} />
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

export default BuyCarDetails;
