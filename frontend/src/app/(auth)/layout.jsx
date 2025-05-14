import GridShape from "@/components/common/GridShape";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({ children }) {
  return (
    <div className="relative px-6 z-1 sm:p-0">
      <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col sm:p-0">
        {children}
        <div className="lg:w-1/2 w-full h-full bg-orange-800 lg:grid items-center hidden">
          <div className="relative items-center justify-center flex z-1">
            <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
              <GridShape />
            </div>
            <div className="flex items-end justify-between max-w-2xl mx-auto">
              <Image
                width={400}
                height={200}
                src="/images/Badge/car-3-removebg.png"
                alt="grid"
                className="object-contain lg:w-[300px] lg:h-[200px]"
              />

              <div className="flex flex-col items-center text-center">
                <Link href="/" className="block mb-4">
                  <Image
                    width={231}
                    height={48}
                    src="/images/logo/mm-logo-white.png"
                    alt="Logo"
                    className="cursor-pointer lg:w-[400px] lg:h-[65px]"
                  />
                </Link>

                <p className="text-neutral-200">
                  Showroom mobil bekas terbaik dan terpercaya
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
