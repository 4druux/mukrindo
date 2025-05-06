import Image from "next/image";
import React from "react";

export default function GridShape() {
  return (
    <>
      <div className="absolute bottom-8 right-0 -z-10 w-auto">
        <Image
          width={720}
          height={338}
          src="/images/shape/grid-01.svg"
          alt="grid"
          className="object-cover object-top-left"
        />
      </div>
      <div className="absolute top-8 left-0 -z-10 w-auto rotate-180">
        <Image
          width={720}
          height={338}
          src="/images/shape/grid-01.svg"
          alt="grid"
          className="object-cover"
        />
      </div>
    </>
  );
}
