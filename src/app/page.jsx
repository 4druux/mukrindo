// Home.js
import CarForm from "@/layout/user/home/CarForm";
import HomeCarousel from "@/layout/user/home/HomeCarousel";
import ProductByPrice from "@/layout/user/home/ProductByPrice";
import ProductByRecom from "@/layout/user/home/ProductByRecom";

export default function Home() {
  const bannerImages = [
    "/images/carousel/1.jpg",
    "/images/carousel/2.jpg",
    "/images/carousel/5.jpg",
    "/images/carousel/7.jpg",
    "/images/carousel/1.jpg",
    "/images/carousel/7.jpg",
  ];

  return (
    <div className="container mx-auto">
      <p className="lg:pt-10 border-t-2 border-gray-200"></p>
      <HomeCarousel images={bannerImages} />
      <div className=" space-y-8 mt-4 pb-8">
        <CarForm />
        <ProductByRecom />
        <ProductByPrice />
      </div>
    </div>
  );
}
