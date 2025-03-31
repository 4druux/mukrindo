// Home.js
import CarForm from "@/layout/user/CarForm";
import Carousel from "@/layout/user/Carousel";
import PrdouctByPrice from "@/layout/user/PrdouctByPrice";
import ProductByRecom from "@/layout/user/ProductByRecom";

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
    <div className="pt-4 lg:pt-10 border-t-2 border-gray-200 mb-10">
      <Carousel images={bannerImages} />
      <CarForm />
      <div className="">
        <p className="text-xl font-medium text-gray-700 mb-2">
          Mobil Pilihan Terbaik
        </p>
        <ProductByRecom />
      </div>

      <div className="my-8">
        <p className="text-xl font-medium text-gray-700 mb-2">
          Mobil Pilihan Sesuai Budget
        </p>
        <PrdouctByPrice />
      </div>
    </div>
  );
}
