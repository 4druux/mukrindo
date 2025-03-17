// Home.js
import CarForm from "@/components/common/CarForm";
import Carousel from "@/components/common/Carousel";
import Link from "next/link";

export default function Home() {
  const bannerImages = [
    "/images/carousel/7.jpg",
    "/images/carousel/7.jpg",
    "/images/carousel/7.jpg",
    "/images/carousel/7.jpg",
    "/images/carousel/7.jpg",
    "/images/carousel/7.jpg",
  ];

  return (
    <div className="h-[150vh] pt-10 border-t-2 border-gray-200">
      {/* Carousel (tanpa perubahan) */}
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
