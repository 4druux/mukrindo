import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaInstagram, FaWhatsapp, FaFacebook } from "react-icons/fa";
import { AiFillTikTok } from "react-icons/ai";

const AppFooter = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className="bg-white mt-14 xl:mt-20"
      style={{ boxShadow: "0px -5px 10px -5px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="container mx-auto flex flex-col xl:flex-row items-start justify-between px-4 xl:px-0 gap-4 xl:gap-10 py-10 text-sm">
        <div className="">
          <Image
            src="/images/logo/mm-logo.png"
            alt="MukrindoLogo"
            width={180}
            height={20}
            priority={true}
            className="cursor-pointer w-[180px] md:w-[200px]"
          />
          <div className="flex items-center space-x-3 my-3">
            <a
              href="https://api.whatsapp.com/send/?phone=%2B6285774723529&text&type=phone_number&app_absent=0"
              target="_blank"
            >
              <FaWhatsapp className="w-6 h-6 text-green-500 hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer" />
            </a>
            <a href="https://twitter.com" target="_blank">
              <FaFacebook className="w-6 h-6 text-blue-500 hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer" />
            </a>
            <a href="https://www.tiktok.com/@mukri.indo.motor" target="_blank">
              <AiFillTikTok className="w-6 h-6 text-[#262626] hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer" />
            </a>
            <a href="https://www.instagram.com/andrew.smg/" target="_blank">
              <FaInstagram className="w-6 h-6 text-[#E4405F] hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer" />
            </a>
          </div>
          <p className="w-full text-gray-600">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt
            illum culpa quo cupiditate minus, sequi repudiandae dolor obcaecati
            sed aliquam.
          </p>
        </div>

        <div className="lg:w-1/4">
          <p className="text-base font-medium mb-2 lg:mb-4 text-gray-800">
            Layanan Kami
          </p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <Link
              href="/beli"
              onClick={scrollToTop}
              className="hover:text-orange-600 cursor-pointer underline"
            >
              <li>Beli Mobil</li>
            </Link>
            <Link
              href="/jual-mobil"
              onClick={scrollToTop}
              className="hover:text-orange-600 cursor-pointer underline"
            >
              <li>Jual Mobil</li>
            </Link>
            <Link
              href="/tukar-tambah"
              onClick={scrollToTop}
              className="hover:text-orange-600 cursor-pointer underline"
            >
              <li>Tukar Tambah</li>
            </Link>
          </ul>
        </div>

        <div className="lg:w-1/4">
          <p className="text-base font-medium mb-2 lg:mb-4 text-gray-800">
            Hubungi Kami
          </p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li className="hover:text-orange-600 cursor-pointer underline">
              <a
                href="https://api.whatsapp.com/send/?phone=%2B6285774723529&text&type=phone_number&app_absent=0"
                target="_blank"
              >
                +6285771257448
              </a>
            </li>
            <li className="hover:text-orange-600 cursor-pointer underline">
              <a href="mailto:mukrindomotor@gmail.com" target="_blank">
                mukrindomotor@gmail.com
              </a>
            </li>
          </ul>
        </div>

        <div className="block lg:hidden">
          <p className="text-base font-medium mb-2 text-gray-800">Ketentuan</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <a
              href="/kebijakan-privasi"
              className="hover:text-orange-600 cursor-pointer underline"
            >
              Kebijakan Privasi
            </a>
            <a
              href="/syarat-ketentuan"
              className="hover:text-orange-600 cursor-pointer underline"
            >
              Syarat & Ketentuan
            </a>
          </ul>
        </div>

        <div className="lg:w-1/4">
          <p className="text-base font-medium mb-2 lg:mb-4 text-gray-800">
            Alamat Kami
          </p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.737447325266!2d106.69474367499107!3d-6.29819149369091!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fb0065e4888f%3A0x48fd1e69c6a6e8a2!2sMukrindo%20Motor!5e0!3m2!1sid!2sid!4v1745671696656!5m2!1sid!2sid"
              width="300"
              height="200"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-0">
        <p className="border-t border-gray-300" />
        <div className="py-5 text-sm text-gray-600 flex justify-center lg:justify-between lg:items-center">
          <div className="hidden lg:block">
            <div className="flex gap-3">
              <a
                href="/syarat-ketentuan"
                className="hover:text-orange-600 cursor-pointer underline"
              >
                Syarat & Ketentuan
              </a>{" "}
              <a
                href="/kebijakan-privasi"
                className="hover:text-orange-600 cursor-pointer underline"
              >
                Kebijakan Privasi
              </a>
            </div>
          </div>
          <p> Copyright © 2025 Mukrindo Motor.</p>
        </div>
      </div>
    </div>
  );
};

export default AppFooter;
