// Home.js
import CarForm from "@/layout/user/home/CarForm";
import Carousel from "@/layout/user/home/Carousel";
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
    <div className="px-2">
      <p className="pt-4 lg:pt-10 border-t-2 border-gray-200"></p>
      <Carousel images={bannerImages} />
      <CarForm />
      <div className="">
        <p className="text-xl font-medium text-gray-700 mb-2">
          Mobil Pilihan Terbaik
        </p>
        <ProductByRecom />
      </div>
      <ProductByPrice />
    </div>
  );
}
