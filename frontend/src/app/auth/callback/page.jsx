"use client";

import React, { Suspense } from "react";
import DotLoader from "@/components/common/DotLoader";
import AuthCallbackClient from "@/components/auth/AuthCallbackClient";

const AuthCallbackPageFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <DotLoader dotSize="w-5 h-5" />
  </div>
);

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackPageFallback />}>
      <AuthCallbackClient />
    </Suspense>
  );
}
