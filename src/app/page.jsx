// Home.js
import Carousel from "@/components/common/Carousel";
import Link from "next/link";

export default function Home() {
  const bannerImages = [
    "/images/carousel/bg-1.png",
    "/images/carousel/bg-1.png",
    "/images/carousel/bg-1.png",
    "/images/carousel/bg-1.png",
    "/images/carousel/bg-1.png",
    "/images/carousel/bg-1.png",
  ];

  return (
    <div className="h-[150vh] pt-10 px-3 md:px-12">
      {/* Carousel (tanpa perubahan) */}
      <Carousel images={bannerImages} />

      {/* Konten lainnya (dengan px-6) */}
      <div className="flex flex-col gap-4 justify-start items-center">
        <p className="text-2xl font-bold">Home</p>
        <Link href="/sign-in">Click to sign in</Link>
        <Link href="/sign-up">Click to sign up</Link>
      </div>
    </div>
  );
}
