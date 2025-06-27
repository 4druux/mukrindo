// frontend/src/components/auth/SignInForm.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// import components
import { useAuth } from "@/context/AuthContext";
import TittleText from "@/components/common/TittleText";
import InputPassword from "@/components/common/InputPassword";
import ButtonAction from "../common/ButtonAction";
import AnimatedArrowRight from "../animate-icon/AnimatedArrowRight";
import toast from "react-hot-toast";

// import icons
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, loading: authLoading, authError, setAuthError } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setErrors({});
    setAuthError(null);
  }, [pathname]);

  const handleInputChange = (setter, fieldName) => (e) => {
    setter(e.target.value);
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: null }));
    }
    if (authError) {
      setAuthError(null);
    }
  };

  const handleGoogleLogin = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    } else {
      console.error("NEXT_PUBLIC_API_URL is not defined");
      toast.error("Konfigurasi error, tidak bisa login dengan Google.", {
        className: "custom-toast",
      });
    }
  };

  const errorMessages = {
    INVALID_CREDENTIALS: "Email atau kata sandi salah.",
    SERVER_ERROR: "Terjadi kesalahan server. Silakan coba lagi.",
    ACCOUNT_LOCKED:
      "Kami mendeteksi terlalu banyak percobaan login yang gagal. Untuk keamanan, silakan coba beberapa saat lagi.",
  };

  const displayError = authError ? errorMessages[authError] || authError : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setErrors({});

    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // email
    if (!email) {
      newErrors.email = "Email wajib diisi.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Format email yang Anda masukkan tidak valid.";
    }

    // password
    if (!password) {
      newErrors.password = "Kata sandi wajib diisi.";
    } else if (password.length < 8) {
      newErrors.password = "Kata sandi minimal harus 8 karakter.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Harap periksa kembali data Anda.", {
        className: "custom-toast",
      });
      return;
    }

    const resp = await login(email, password);
    if (!resp.success) {
      let toastMsg;
      if (resp.error === "ACCOUNT_LOCKED") {
        const sec = resp.retryAfter || 0;
        toastMsg =
          sec > 60
            ? `Silakan coba lagi dalam ${Math.ceil(sec / 60)} menit.`
            : `Silakan coba lagi dalam ${sec} detik.`;
      } else {
        toastMsg = errorMessages[resp.error] || errorMessages.SERVER_ERROR;
      }
      toast.error(toastMsg, { className: "custom-toast" });
      return;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-[100dvh] justify-start items-start 2xl:justify-center 2xl:items-center 2xl:w-1/2 w-full py-4">
      <div className="w-full pt- 2xl:pt-0 max-w-md mx-auto mb-2">
        <Link href="/">
          <div className="flex items-center justify-center">
            <Image
              src="/images/logo/mm-logo.png"
              alt="MukrindoLogo"
              width={130}
              height={35}
              priority
              className="w-auto h-auto max-w-[200px] max-h-[80px] object-cover"
            />
          </div>
        </Link>
      </div>

      <div className="flex flex-col justify-center pt-5 w-full max-w-lg mx-auto">
        <div>
          <div className="mb-2 md:mb-5 text-left">
            <TittleText text="Masuk Sekarang" className="text-xl md:text-2xl" />
          </div>

          <div>
            <div className="grid grid-cols-1">
              <button
                onClick={handleGoogleLogin}
                type="button"
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

            {displayError && !authLoading && (
              <p className="text-xs text-red-500 text-center mb-4 p-2 bg-red-50 border border-red-200 rounded">
                {displayError}
              </p>
            )}

            <form onSubmit={handleSubmit} noValidate>
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
                    onChange={handleInputChange(setEmail, "email")}
                    className={`block w-full px-4 py-2 text-base lg:text-sm text-gray-700 bg-white border rounded-lg placeholder-gray-400/70 focus:outline-none ${
                      errors.email || displayError
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-orange-300"
                    }`}
                  />
                  <div className="mt-1 min-h-[1rem]">
                    {errors.email && (
                      <p className="text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>

                <InputPassword
                  label="Kata Sandi"
                  id="password-signin"
                  name="password"
                  value={password}
                  onChange={handleInputChange(setPassword, "password")}
                  placeholder="Masukkan kata sandi anda"
                  autoComplete="current-password"
                  error={
                    errors.password ? errors.password : Boolean(displayError)
                  }
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
                    href="/forgot-password"
                    className="text-sm text-orange-600 hover:underline"
                  >
                    Lupa kata sandi?
                  </Link>
                </div>

                <div>
                  <ButtonAction
                    type="submit"
                    disabled={authLoading}
                    className="w-full"
                  >
                    {authLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Masuk"
                    )}
                    {!authLoading && (
                      <AnimatedArrowRight className="w-5 h-5" color="white" />
                    )}
                  </ButtonAction>
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
