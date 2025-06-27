"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import TittleText from "@/components/common/TittleText";
import ButtonAction from "@/components/common/ButtonAction";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, loading, authError, setAuthError } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setErrors({});
    setAuthError(null);
  }, [pathname, setAuthError]);

  const handleInputChange = (setter, fieldName) => (e) => {
    setter(e.target.value);
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: null }));
    }
    if (authError) {
      setAuthError(null);
    }
  };

  const errorMessages = {
    SERVER_ERROR: "Gagal mengirim email reset. Silakan coba lagi.",
  };

  const displayError = authError ? errorMessages[authError] || authError : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setErrors({});

    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = "Email wajib diisi.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Format email yang Anda masukkan tidak valid.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Harap periksa kembali alamat email Anda.", {
        className: "custom-toast",
      });
      return;
    }

    const resp = await forgotPassword(email);
    if (resp.success) {
      setIsSubmitted(true);
      toast.success("Jika email sesuai, kami telah mengirim link reset.", {
        className: "custom-toast",
      });
    } else {
      const serverErrorMsg =
        errorMessages[resp.error] || errorMessages.SERVER_ERROR;
      toast.error(serverErrorMsg, { className: "custom-toast" });
    }
  };

  return (
    <div className="flex flex-col w-full p-4">
      <div className="w-full max-w-md pt-5 md:pt-10 mx-auto mb-5">
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

      <div className="flex flex-col justify-center pt-5 w-full max-w-md mx-auto">
        <div className="mb-2 md:mb-5 text-left flex items-center">
          <Link href="/login">
            <ArrowLeft
              className="inline-block mr-2 text-gray-700 cursor-pointer hover:scale-125 transition-transform duration-300"
              size={20}
            />
          </Link>
          <TittleText text="Lupa Kata Sandi" className="text-xl md:text-2xl" />
        </div>

        {isSubmitted ? (
          <div className="flex flex-col space-y-4">
            <div className="p-6 text-center bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-700">
                Permintaan Terkirim
              </h3>
              <p className="mt-2 text-sm text-green-700">
                Jika email <span className="font-semibold">{email}</span>{" "}
                terdaftar di sistem kami, Anda akan menerima email berisi link
                untuk mereset kata sandi Anda.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-6 text-sm text-gray-600">
              Masukkan alamat email Anda yang terdaftar. Kami akan mengirimkan
              link untuk mereset kata sandi Anda.
            </p>

            {displayError && !loading && (
              <p className="text-xs text-red-500 text-center mb-4 p-2 bg-red-50 border border-red-200 rounded">
                {displayError}
              </p>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="email-forgot"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="Masukkan email anda"
                    type="email"
                    id="email-forgot"
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

                <div>
                  <ButtonAction
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Kirim Link Reset"
                    )}
                  </ButtonAction>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
