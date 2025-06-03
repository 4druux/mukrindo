// frontend/src/components/auth/AuthCallbackClient.jsx
"use client";

import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import DotLoader from "@/components/common/DotLoader";
import Link from "next/link";

export default function AuthCallbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { handleOAuthSuccess } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");
    const userId = searchParams.get("userId");
    const firstNameFromParams = searchParams.get("firstName");
    const email = searchParams.get("email");
    const loginType = searchParams.get("loginType");
    const messageFromParams = searchParams.get("message");
    const errorType = searchParams.get("error");
    const hasPasswordParam = searchParams.get("hasPassword");

    if (errorType === "admin_access_denied") {
      const displayMessage = messageFromParams || "Anda tidak memiliki akses.";
      toast.error(displayMessage, { className: "custom-toast" });
      router.replace("/");
      return;
    }

    if (token && role && userId && email) {
      const authData = {
        token,
        role,
        _id: userId,
        firstName: firstNameFromParams
          ? decodeURIComponent(firstNameFromParams)
          : "",
        lastName: searchParams.get("lastName")
          ? decodeURIComponent(searchParams.get("lastName"))
          : "",
        email: email ? decodeURIComponent(email) : "",
        avatar: searchParams.get("avatar")
          ? decodeURIComponent(searchParams.get("avatar"))
          : null,
        hasPassword: hasPasswordParam === "true",
        loginType: loginType || "unknown",
        message: messageFromParams
          ? decodeURIComponent(messageFromParams)
          : null,
      };
      handleOAuthSuccess(authData);
    } else if (!errorType) {
      console.error(
        "Auth callback: Parameter login tidak lengkap atau tidak valid.",
        Object.fromEntries(searchParams)
      );
      toast.error("Login gagal atau tidak valid. Silakan coba lagi.", {
        className: "custom-toast",
      });
      router.replace("/login?error=callback_error");
    } else if (errorType && !token) {
      const decodedError = messageFromParams
        ? decodeURIComponent(messageFromParams)
        : "Terjadi kesalahan saat login dengan Google.";
      toast.error(decodedError, { className: "custom-toast" });
      router.replace("/login");
    }
  }, [searchParams, router, handleOAuthSuccess]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <DotLoader dotSize="w-5 h-5" />
      <noscript>
        <div className="mt-8 text-center">
          <p className="text-red-500">
            JavaScript dibutuhkan untuk menyelesaikan proses ini.
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
