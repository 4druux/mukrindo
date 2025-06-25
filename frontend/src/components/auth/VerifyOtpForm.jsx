// frontend/src/components/auth/VerifyOtpForm.jsx

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import TittleText from "@/components/common/TittleText";
import ButtonAction from "@/components/common/ButtonAction";
import AnimatedArrowRight from "@/components/animate-icon/AnimatedArrowRight";

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const { verifyOtp, resendOtp, loading, authError, setAuthError } = useAuth();
  const length = 6;
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);

  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
    setAuthError(null);
  }, [email, router, setAuthError]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    } else {
      setIsResendDisabled(false);
    }
  }, [resendCooldown]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = new Array(length).fill("");
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);

    const nextFocusIndex =
      pasteData.length < length ? pasteData.length : length - 1;
    inputRefs.current[nextFocusIndex].focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== length) {
      setAuthError(`OTP harus ${length} digit.`);
      return;
    }
    await verifyOtp(email, otpString);
  };

  const handleResend = async () => {
    if (isResendDisabled || remainingAttempts <= 0) return;
    setIsResendDisabled(true);
    setResendCooldown(60);

    const result = await resendOtp(email);
    if (result && result.success) {
      setRemainingAttempts((prev) => (prev > 0 ? prev - 1 : 0));
    } else {
      setIsResendDisabled(false);
      setResendCooldown(0);
    }
  };

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

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
              className="cursor-pointer w-[200px] h-[60px]"
            />
          </div>
        </Link>
      </div>

      <div className="flex flex-col justify-center pt-5 w-full max-w-md mx-auto">
        <div className="text-center">
          <TittleText
            text="Verifikasi Login Admin"
            className="text-2xl md:text-3xl"
          />
          <p className="mt-2 text-gray-600">
            Kami telah mengirimkan kode 6 digit ke <br />
            <span className="font-semibold text-gray-800">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-8 space-y-4">
          <div
            className="flex justify-center gap-2 md:gap-4"
            onPaste={handlePaste}
          >
            {otp.map((value, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                value={value}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-medium text-gray-600 border border-gray-300 focus:outline-none rounded-lg focus:border-2 focus:border-orange-300 transition"
              />
            ))}
          </div>

          {authError && (
            <p className="text-sm text-red-600 text-center">{authError}</p>
          )}

          <div>
            <ButtonAction type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Verifikasi & Masuk"
              )}
              {!loading && (
                <AnimatedArrowRight className="w-5 h-5" color="white" />
              )}
            </ButtonAction>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Tidak menerima kode?{" "}
            {isResendDisabled ? (
              <span className="text-gray-500">
                Kirim ulang lagi dalam {resendCooldown} detik
              </span>
            ) : (
              <button
                onClick={handleResend}
                disabled={remainingAttempts <= 0}
                className="font-medium text-orange-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                Kirim ulang ({remainingAttempts})
              </button>
            )}
          </p>
          {remainingAttempts <= 0 && !isResendDisabled && (
            <p className="text-xs text-red-500 mt-1">
              Batas kirim ulang OTP telah tercapai.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
