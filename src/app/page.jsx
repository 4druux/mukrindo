// Home.js
import CarForm from "@/layout/user/CarForm";
import Carousel from "@/layout/user/Carousel";
import Link from "next/link";

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
    <div className="pt-4 lg:pt-10 border-t-2 border-gray-200">
      <Carousel images={bannerImages} />
      <CarForm />

      {/* Konten lainnya (dengan px-6) */}
      <div className="flex flex-col gap-4 justify-start items-center">
        <p className="text-2xl font-bold">Home</p>
        <Link href="/sign-in">Click to sign in</Link>
        <Link href="/sign-up">Click to sign up</Link>
      </div>
    </div>
  );
}
