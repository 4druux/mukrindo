// frontend/src/app/auth/callback/page.jsx
"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import DotLoader from "@/components/common/DotLoader";
import Link from "next/link";

const AuthCallbackPage = () => {
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

    if (errorType === "admin_access_denied") {
      const displayMessage = messageFromParams || "Anda tidak memiliki akses.";
      toast.error(displayMessage, { className: "custom-toast" });
      router.replace("/");
      return;
    }

    if (token && role && userId && email) {
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
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <DotLoader dotSize="w-5 h-5" />
        </div>
      }
    >
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
    </Suspense>
  );
};

export default AuthCallbackPage;
