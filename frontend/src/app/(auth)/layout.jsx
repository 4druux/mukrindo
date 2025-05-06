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
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <Image
                width={400}
                height={200}
                src="/images/Badge/car-3-removebg.png"
                alt="grid"
                className="object-contain"
              />

              <div className="flex flex-col items-center text-center">
                <Link href="/" className="block mb-4">
                  <Image
                    width={231}
                    height={48}
                    src="./images/logo/auth-logo.svg"
                    alt="Logo"
                  />
                </Link>
                <h1 className="mb-4 text-3xl font-bold text-white">
                  Mukrindo Motor
                </h1>
                <p className="text-neutral-300">Showroom mobil bekas terbaik dan terpercaya</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
