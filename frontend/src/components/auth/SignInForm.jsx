// frontend/src/components/auth/SignInForm.jsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import TittleText from "@/components/common/TittleText";
import InputPassword from "@/components/common/InputPassword";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const { login, loading: authLoading, authError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan kata sandi wajib diisi.", {
        className: "custom-toast",
      });
      return;
    }
    await login(email, password);
  };

  const handleGoogleLogin = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
    } else {
      console.error("NEXT_PUBLIC_API_URL is not defined");
      toast.error("Konfigurasi error, tidak bisa login dengan Google.");
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full py-4">
      <div className="w-full max-w-md pt-5 md:pt-10 mx-auto mb-5">
        <Link href="/">
          <div className="flex items-center justify-center">
            <Image
              src="/images/logo/mm-logo.png"
              alt="MukrindoLogo"
              width={130}
              height={35}
              priority
              className="cursor-pointer w-[200px] h-[60px]"
            />
          </div>
        </Link>
      </div>

      <div className="flex flex-col justify-center pt-5 w-full max-w-md mx-auto">
        <div>
          <div className="mb-2 md:mb-5 text-left">
            <TittleText text="Masuk Sekarang" className="text-xl md:text-2xl" />
          </div>

          <div>
            <div className="grid grid-cols-1">
              <button
                onClick={handleGoogleLogin}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-medium text-gray-600 transition-colors bg-gray-50 rounded-lg px-7 hover:bg-gray-100 hover:text-gray-800 cursor-pointer"
              >
                <FcGoogle className="w-8 h-8" />
                Masuk dengan Google
              </button>
            </div>

            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white sm:px-5 sm:py-2">
                  Atau Masuk dengan
                </span>
              </div>
            </div>

            {authError && !authLoading && (
              <p className="text-xs text-red-500 text-center mb-4">
                {authError}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="email-signin"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="Masukkan email anda"
                    type="email"
                    id="email-signin"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full px-4 py-2 text-base lg:text-sm text-gray-700 bg-white border border-gray-300 rounded-lg placeholder-gray-400/70 focus:border-orange-300 focus:outline-none"
                  />
                </div>
                <InputPassword
                  label="Kata Sandi"
                  id="password-signin"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi anda"
                  autoComplete="current-password"
                  required
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                      className="rounded border-gray-300 accent-orange-600 focus:outline-none w-3.5 h-3.5 cursor-pointer"
                    />
                    <label htmlFor="remember" className="text-gray-600 text-sm">
                      Ingat saya
                    </label>
                  </div>
                  <Link
                    href="/reset-password" // Pastikan path ini ada
                    className="text-sm text-orange-600 hover:underline"
                  >
                    Lupa kata sandi?
                  </Link>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition cursor-pointer bg-gradient-to-br from-red-500 via-orange-400 to-yellow-400 hover:bg-orange-600 hover:from-transparent hover:to-transparent rounded-full disabled:opacity-70"
                  >
                    {authLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Masuk"
                    )}
                    {!authLoading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-4">
              <p className="text-sm font-normal text-center text-gray-700 sm:text-start">
                Tidak punya akun?
                <Link
                  href="/register"
                  className="text-orange-600 ml-1 hover:underline"
                >
                  Daftar Sekarang
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
