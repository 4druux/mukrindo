// Home.js
import CarForm from "@/layout/user/home/CarForm";
import HomeAccordion from "@/layout/user/home/HomeAccordion";
import HomeBedge from "@/layout/user/home/HomeBedge";
import NotifyMeForm from "@/components/product-user/NotifyMeForm";
import HomeCarousel from "@/layout/user/home/HomeCarousel";
import ProductByPrice from "@/layout/user/home/ProductByPrice";
import ProductByRecom from "@/layout/user/home/ProductByRecom";

export default function Home() {
  const bannerImages = [
    "/images/carousel/carousel-1.jpg",
    "/images/carousel/carousel-2.jpg",
    "/images/carousel/carousel-3.jpg",
    "/images/carousel/carousel-4.jpg",
    "/images/carousel/2.jpg",
    "/images/carousel/5.jpg",
    "/images/carousel/7.jpg",
  ];

  return (
    <div className="container mx-auto">
      <p className="lg:pt-10 border-t-2 border-gray-200"></p>
      <HomeCarousel images={bannerImages} />
      <div className="space-y-8 lg:space-y-12 mt-4 lg:mt-10">
        <CarForm />
        <ProductByRecom />
        <ProductByPrice />
        <div className="px-4 lg:px-0 space-y-8 lg:space-y-12">
          <HomeBedge />
          <NotifyMeForm />
          <HomeAccordion />
        </div>
      </div>
    </div>
  );
}
