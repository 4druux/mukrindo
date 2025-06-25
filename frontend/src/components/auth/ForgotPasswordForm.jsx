"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Loader2 } from "lucide-react";
import TittleText from "@/components/common/TittleText";
import ButtonAction from "@/components/common/ButtonAction";
import toast from "react-hot-toast";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, loading, authError, setAuthError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (!email) {
      toast.error("Email wajib diisi.");
      return;
    }
    const result = await forgotPassword(email);
    if (result.success) {
      setIsSubmitted(true);
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
              <h3 className="text-lg font-semibold text-green-800">
                Permintaan Terkirim
              </h3>
              <p className="mt-2 text-sm text-green-700">
                Jika email <span className="font-bold">{email}</span> terdaftar
                di sistem kami, Anda akan menerima email berisi link untuk
                mereset kata sandi Anda.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-6 text-sm text-gray-600">
              Masukkan alamat email Anda yang terdaftar. Kami akan mengirimkan
              link untuk mereset kata sandi Anda.
            </p>
            {authError && (
              <p className="text-xs text-red-500 text-center mb-4 p-2 bg-red-50 border border-red-200 rounded">
                {authError}
              </p>
            )}
            <form onSubmit={handleSubmit}>
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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full px-4 py-2 text-base lg:text-sm text-gray-700 bg-white border border-gray-300 rounded-lg placeholder-gray-400/70 focus:border-orange-300 focus:outline-none"
                  />
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
