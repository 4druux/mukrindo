"use client";

import { IoEye, IoEyeOff } from "react-icons/io5";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import TittleText from "../common/TittleText";

export default function SignUpForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { register, loading: authLoading, authError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      toast.error("Semua field wajib diisi.", { className: "custom-toast" });
      return;
    }
    if (!termsAccepted) {
      toast.error(
        "Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi.",
        {
          className: "custom-toast",
        }
      );
      return;
    }
    await register(firstName, lastName, email, password);
  };

  const handleGoogleLogin = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
    } else {
      console.error("NEXT_PUBLIC_API_URL is not defined");
      toast.error("Konfigurasi error, tidak bisa daftar dengan Google.");
    }
  };

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
          <div className="mb-2 md:mb-5 text-left">
            <TittleText text="Daftar Sekarang" className="text-xl md:text-2xl" />
          </div>

          <div>
            <div className="grid grid-cols-1">
              <button
                onClick={handleGoogleLogin}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-medium text-gray-600 transition-colors bg-gray-50 rounded-lg px-7 hover:bg-gray-100 hover:text-gray-800 cursor-pointer"
              >
                <FcGoogle className="w-8 h-8" />
                Daftar dengan Google
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

            {authError && !authLoading && (
              <p className="text-xs text-red-500 text-center mt-4 mb-2">
                {authError}
              </p>
            )}

            {/* --- Form --- */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="fname-signup"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Nama Depan<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fname-signup"
                      name="fname"
                      placeholder="Nama Depan anda"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="block w-full px-4 py-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg placeholder-gray-400/70 focus:border-orange-400 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-40"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="lname-signup"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Nama Belakang<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lname-signup"
                      name="lname"
                      placeholder="Nama Belakang anda"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="block w-full px-4 py-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg placeholder-gray-400/70 focus:border-orange-400 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-40"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email-signup"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Email<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email-signup"
                    name="email"
                    placeholder="Masukkan email anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full px-4 py-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg placeholder-gray-400/70 focus:border-orange-400 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-40"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password-signup"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Kata Sandi<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      placeholder="Masukkan kata sandi anda"
                      type={showPassword ? "text" : "password"}
                      id="password-signup"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="block w-full px-4 py-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg placeholder-gray-400/70 focus:border-orange-400 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-40"
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
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 accent-orange-600 focus:outline-none w-3.5 h-3.5 cursor-pointer"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    id="agree-signup"
                  />
                  <label
                    htmlFor="agree-signup"
                    className="inline-block text-gray-500 text-xs"
                  >
                    Saya setuju dengan{" "}
                    <a
                      href="/syarat-ketentuan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 underline cursor-pointer"
                    >
                      Syarat & Ketentuan
                    </a>{" "}
                    serta{" "}
                    <a
                      href="/kebijakan-privasi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 underline cursor-pointer"
                    >
                      Kebijakan Privasi
                    </a>
                  </label>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition cursor-pointer bg-gradient-to-r from-orange-400 to-orange-600 hover:bg-orange-600 hover:from-transparent hover:to-transparent rounded-full disabled:opacity-70"
                  >
                    {authLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Daftar"
                    )}
                    {!authLoading && <ArrowRight className="w-5 h-5" />}
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
