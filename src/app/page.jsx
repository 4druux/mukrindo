// Home.js
import CarForm from "@/layout/user/CarForm";
import Carousel from "@/layout/user/Carousel";
import CarProduct from "@/layout/user/CarProduct";

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
      <CarProduct />
    </div>
  );
}
