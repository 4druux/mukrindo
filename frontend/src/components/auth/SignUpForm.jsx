// frontend/src/components/auth/SignUpForm.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// import components
import { useAuth } from "@/context/AuthContext";
import TittleText from "@/components/common/TittleText";
import InputPassword from "@/components/common/InputPassword";
import ButtonAction from "../common/ButtonAction";
import AnimatedArrowRight from "../animate-icon/AnimatedArrowRight";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";

// import icons
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function SignUpForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, loading: authLoading, authError, setAuthError } = useAuth();
  const pathname = usePathname();

  const [adminCount, setAdminCount] = useState(0);
  const [isCheckingAdmins, setIsCheckingAdmins] = useState(true);
  const showAdminButton = !isCheckingAdmins && adminCount < 2;

  useEffect(() => {
    const fetchAdminCount = async () => {
      try {
        const { data } = await axiosInstance.get("/auth/admin-count");
        setAdminCount(data.adminCount);
      } catch (err) {
        console.error("Gagal mengambil data admin:", err);
        setAdminCount(2);
      } finally {
        setIsCheckingAdmins(false);
      }
    };
    fetchAdminCount();
  }, []);

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
      toast.error("Konfigurasi error, tidak bisa daftar dengan Google.");
    }
  };

  const errorMessages = {
    EMAIL_TAKEN: "Email sudah terdaftar.",
    ADMIN_REG_LIMIT: "Pendaftaran admin sudah tidak tersedia.",
    SERVER_ERROR: "Terjadi kesalahan server. Silakan coba lagi.",
  };

  const displayError = authError ? errorMessages[authError] || authError : null;

  const handleSubmit = (role) => async (e) => {
    e.preventDefault();
    setAuthError(null);
    setErrors({});

    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName) newErrors.firstName = "Nama depan wajib diisi.";
    if (!lastName) newErrors.lastName = "Nama belakang wajib diisi.";

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

    // confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi kata sandi wajib diisi.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi kata sandi tidak cocok.";
    }

    // terms
    if (!termsAccepted)
      newErrors.terms =
        "*Silahkan centang Syarat dan ketentuan serta Kebijakan Privasi";

    const nonTermsKeys = Object.keys(newErrors).filter(
      (key) => key !== "terms"
    );

    if (nonTermsKeys.length > 0) {
      setErrors(newErrors);
      toast.error("Harap periksa kembali data Anda.", {
        className: "custom-toast",
      });
      return;
    }

    if (newErrors.terms) {
      setErrors(newErrors);
      toast.error(newErrors.terms, { className: "custom-toast" });
      return;
    }

    const resp = await register(firstName, lastName, email, password, role);
    if (!resp.success) {
      const msg = errorMessages[resp.error] || errorMessages.SERVER_ERROR;
      toast.error(msg, { className: "custom-toast" });
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-[100dvh] justify-start items-start 2xl:justify-center 2xl:items-center 2xl:w-1/2 w-full py-4">
      <div className="w-full 2xl:pt-0 max-w-md mx-auto mb-2">
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
            <TittleText
              text="Daftar Sekarang"
              className="text-xl md:text-2xl"
            />
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

            {displayError && !authLoading && (
              <p className="text-xs text-red-500 text-center mb-4 p-2 bg-red-50 border border-red-200 rounded">
                {displayError}
              </p>
            )}

            <form noValidate>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="fname-signup"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Nama Depan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fname-signup"
                      name="fname"
                      placeholder="Nama Depan anda"
                      value={firstName}
                      onChange={handleInputChange(setFirstName, "firstName")}
                      className={`block w-full px-4 py-2 text-base lg:text-sm text-gray-700 bg-white border rounded-lg placeholder-gray-400/70 focus:outline-none ${
                        errors.firstName || displayError
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-orange-300"
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <label
                      htmlFor="lname-signup"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Nama Belakang <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lname-signup"
                      name="lname"
                      placeholder="Nama Belakang anda"
                      value={lastName}
                      onChange={handleInputChange(setLastName, "lastName")}
                      className={`block w-full px-4 py-2 text-base lg:text-sm text-gray-700 bg-white border rounded-lg placeholder-gray-400/70 focus:outline-none ${
                        errors.lastName || displayError
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-orange-300"
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email-signup"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email-signup"
                    name="email"
                    placeholder="Masukkan email anda"
                    value={email}
                    onChange={handleInputChange(setEmail, "email")}
                    className={`block w-full px-4 py-2 text-base lg:text-sm text-gray-700 bg-white border rounded-lg placeholder-gray-400/70 focus:outline-none ${
                      errors.email || displayError
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-orange-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <InputPassword
                    label="Kata Sandi"
                    id="password-signup"
                    value={password}
                    onChange={handleInputChange(setPassword, "password")}
                    placeholder="Masukkan kata sandi anda"
                    autoComplete="new-password"
                    error={
                      errors.password ? errors.password : Boolean(displayError)
                    }
                  />
                  <InputPassword
                    label="Konfirmasi Kata Sandi"
                    id="confirm-password-signup"
                    value={confirmPassword}
                    onChange={handleInputChange(
                      setConfirmPassword,
                      "confirmPassword"
                    )}
                    placeholder="Konfirmasi kata sandi anda"
                    autoComplete="new-password"
                    error={
                      errors.confirmPassword
                        ? errors.confirmPassword
                        : Boolean(displayError)
                    }
                  />{" "}
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

                <div
                  className={`flex ${
                    showAdminButton ? "flex-col sm:flex-row gap-3" : "flex-col"
                  }`}
                >
                  <ButtonAction
                    onClick={handleSubmit("user")}
                    disabled={authLoading}
                    className="w-full"
                  >
                    {authLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : showAdminButton ? (
                      "Daftar User"
                    ) : (
                      "Daftar"
                    )}
                    {!authLoading && (
                      <AnimatedArrowRight className="w-5 h-5" color="white" />
                    )}
                  </ButtonAction>

                  {showAdminButton && (
                    <ButtonAction
                      onClick={handleSubmit("admin")}
                      disabled={authLoading}
                      className="w-full"
                      variant="secondary"
                    >
                      {authLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Daftar Admin"
                      )}
                      {!authLoading && (
                        <AnimatedArrowRight className="w-5 h-5" color="white" />
                      )}
                    </ButtonAction>
                  )}
                </div>
              </div>
            </form>

            <div className="my-3">
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
