"use client";

import { IoEye, IoEyeOff } from "react-icons/io5";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full py-4">
      <div className="w-full max-w-md pt-5 mx-auto mb-5">
        <Link href="/">
          <div className="flex items-center justify-center">
            <Image
              src="/images/logo/mm-logo.png"
              alt="MukrindoLogo"
              width={130}
              height={35}
              className="cursor-pointer w-[200px] h-[60px]"
            />
          </div>
        </Link>
      </div>

      <div className="flex flex-col justify-center pt-5 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 text-left">
            <div className="inline-flex items-center gap-2 mb-1">
              <p className="prata-regular text-xl md:text-2xl">
                Daftar Sekarang
              </p>
              <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              {/* --- Google Sign-Up Button --- */}
              <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-medium text-gray-700 transition-colors bg-gray-50 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 cursor-pointer">
                <FcGoogle className="w-8 h-8 lg:w-12 lg:h-12" />
                Daftar dengan Google
              </button>

              {/* --- X Sign-Up Button --- */}
              <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-medium text-gray-700 transition-colors bg-gray-50 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 cursor-pointer">
                <FaXTwitter className="w-6 h-6" />
                Daftar dengan X
              </button>
            </div>

            {/* --- Separator --- */}
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white sm:px-5 sm:py-2">
                  Atau daftar dengan
                </span>
              </div>
            </div>

            {/* --- Form --- */}
            <form>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* --- First Name --- */}
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="fname"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Nama Depan<span className="text-error-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fname"
                      name="fname"
                      placeholder="Nama Depan anda"
                      className="block w-full px-4 py-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg
                       placeholder-gray-400/70 focus:border-orange-400 focus:outline-none focus:ring focus:ring-orange-300 
                       focus:ring-opacity-40"
                    />
                  </div>

                  {/* --- Last Name --- */}
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="lname"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Nama Belakang<span className="text-error-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lname"
                      name="lname"
                      placeholder="Nama Belakang anda"
                      className="block w-full px-4 py-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg
                     placeholder-gray-400/70 focus:border-orange-400 focus:outline-none focus:ring focus:ring-orange-300 
                     focus:ring-opacity-40"
                    />
                  </div>
                </div>

                {/* --- Email --- */}
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Email<span className="text-error-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Masukkan email anda"
                    className="block w-full px-4 py-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg placeholder-gray-400/70 
                    focus:border-orange-400 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-40"
                  />
                </div>

                {/* --- Password --- */}
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Kata Sandi<span className="text-error-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      placeholder="Masukkan kata sandi anda"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="block w-full px-4 py-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg placeholder-gray-400/70 
                      focus:border-orange-400 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-40"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <IoEye className="fill-gray-500" />
                      ) : (
                        <IoEyeOff className="fill-gray-500" />
                      )}
                    </span>
                  </div>
                </div>

                {/* --- Checkbox --- */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 accent-orange-600 focus:outline-none w-3.5 h-3.5 cursor-pointer"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    id="agree"
                  />
                  <label
                    htmlFor="agree"
                    className="inline-block font-normal text-gray-500 text-xs"
                  >
                    Saya setuju dengan{" "}
                    <a
                      href="#"
                      className="text-orange-600 underline cursor-pointer"
                    >
                      Syarat & Ketentuan
                    </a>{" "}
                    serta{" "}
                    <a
                      href="#"
                      className="text-orange-600 underline cursor-pointer"
                    >
                      Kebijakan Privasi
                    </a>
                  </label>
                </div>

                {/* --- Button --- */}
                <div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition cursor-pointer bg-gradient-to-r from-orange-400 to-orange-600 
                    hover:bg-orange-600 hover:from-transparent hover:to-transparent  rounded-full"
                  >
                    Daftar
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </form>

            {/* --- Sign In Link --- */}
            <div className="mt-3">
              <p className="text-sm font-normal text-center text-gray-700 sm:text-start">
                Sudah punya akun?
                <Link
                  href="/login"
                  className="text-orange-600 ml-1 hover:underline"
                >
                  Masuk Sekarang
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
