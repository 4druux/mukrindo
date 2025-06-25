// frontend/src/app/verify-otp/page.jsx

import VerifyOtpForm from "@/components/auth/VerifyOtpForm";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Mukrindo Motor | Verifikasi OTP",
  description: "Halaman Verifikasi OTP untuk Login Admin",
};

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin" size={48} />
        </div>
      }
    >
      <VerifyOtpForm />
    </Suspense>
  );
}
