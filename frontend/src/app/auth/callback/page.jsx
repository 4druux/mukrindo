// frontend/src/app/auth/callback/page.jsx
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import DotLoader from "@/components/common/DotLoader";
import Link from "next/link";

function CallbackPageLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { handleOAuthSuccess } = useAuth();
  const [pageMessage, setPageMessage] = useState(
    "Sedang memproses, mohon tunggu..."
  );

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");
    const userId = searchParams.get("userId");
    const firstNameFromParams = searchParams.get("firstName");
    const email = searchParams.get("email");
    const loginType = searchParams.get("loginType");
    const messageFromParams = searchParams.get("message");
    const errorType = searchParams.get("error");

    if (errorType === "admin_access_denied") {
      const displayMessage =
        messageFromParams ||
        "Anda tidak memiliki izin untuk mengakses halaman ini.";
      toast.error(displayMessage, { className: "custom-toast" });

      router.replace("/");

      return;
    } else if (token && role && userId && email) {
      setPageMessage("Login berhasil! Mengalihkan...");
      let dynamicMessage = messageFromParams;
      if (!dynamicMessage) {
        dynamicMessage = `Login dengan ${
          role === "admin" ? "akun admin " : ""
        }${loginType === "manual" ? "email" : "Google"} berhasil!`;
      }
      const authData = {
        token,
        role,
        _id: userId,
        firstName: firstNameFromParams
          ? decodeURIComponent(firstNameFromParams)
          : "",
        email: email ? decodeURIComponent(email) : "",
        message: dynamicMessage,
      };
      handleOAuthSuccess(authData);
    } else if (!errorType) {
      setPageMessage("Gagal memproses. Mengalihkan ke login...");
      console.error(
        "Auth callback: Parameter login sukses tidak lengkap.",
        Object.fromEntries(searchParams)
      );
      toast.error("Login gagal: Informasi login tidak lengkap.", {
        className: "custom-toast",
      });
      router.replace("/login?error=incomplete_login_params");
    }
  }, [searchParams, router, handleOAuthSuccess]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <DotLoader
        dotSize="w-5 h-5"
        dotColor="bg-gradient-to-r from-orange-500 to-amber-500"
        textSize="text-xl"
        textColor="text-gray-700"
      />
      <p className="mt-6 text-gray-600 text-center">{pageMessage}</p>
      <noscript>
        <div className="mt-8 text-center">
          <p className="text-red-500">
            JavaScript dibutuhkan untuk menyelesaikan proses.
          </p>
          <Link
            href="/login"
            className="text-orange-600 hover:underline mt-2 block"
          >
            Kembali ke Halaman Login
          </Link>
        </div>
      </noscript>
    </div>
  );
}

function CallbackPageFallbackLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <DotLoader
        dotSize="w-5 h-5"
        dotColor="bg-gradient-to-r from-orange-500 to-amber-500"
        textSize="text-xl"
        textColor="text-gray-700"
      />
      <p className="mt-6 text-gray-600 text-center">
        Memuat halaman autentikasi...
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackPageFallbackLoader />}>
      <CallbackPageLogic />
    </Suspense>
  );
}
