"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import TittleText from "@/components/common/TittleText";
import ButtonAction from "@/components/common/ButtonAction";
import AnimatedArrowRight from "@/components/animate-icon/AnimatedArrowRight";
import { Loader2 } from "lucide-react";
import DotLoader from "../common/DotLoader";

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const { verifyOtp, resendOtp, loading, authError, setAuthError } = useAuth();

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [errors, setErrors] = useState({});
  const inputRefs = useRef([]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    setAuthError(null);
    setErrors({});
    if (!email) {
      toast.error("Sesi tidak valid, silakan coba lagi.");
      router.push("/login");
    } else {
      inputRefs.current[0]?.focus();
    }
  }, [email, router, setAuthError]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown(resendCooldown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]$/.test(value) && value !== "") return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (errors.otp) {
      setErrors({});
    }
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^[0-9]+$/.test(pastedData)) {
      const newOtp = new Array(6).fill("");
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      inputRefs.current[Math.min(5, pastedData.length - 1)]?.focus();
    }
  };

  const errorMessages = {
    INVALID_OTP: "Kode OTP yang Anda masukkan salah atau sudah kedaluwarsa.",
    EMAIL_NOT_FOUND: "Email tidak ditemukan.",
    RESEND_LIMIT_EXCEEDED: "Anda telah mencapai batas kirim ulang OTP.",
    SERVER_ERROR: "Terjadi kesalahan pada server, silakan coba lagi.",
  };
  const displayError = authError ? errorMessages[authError] || authError : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setErrors({});

    const code = otp.join("");
    if (code.length !== 6) {
      setErrors({ otp: "Kode OTP harus terdiri dari 6 digit." });
      toast.error("Harap periksa kembali kode OTP Anda.", {
        className: "custom-toast",
      });
      return;
    }

    const resp = await verifyOtp(email, code);
    if (!resp.success) {
      if (resp.error === "INVALID_OTP") {
        toast.error("Kode OTP tidak valid.", {
          className: "custom-toast",
        });
      } else {
        const serverErrorMsg =
          errorMessages[resp.error] || errorMessages.SERVER_ERROR;
        toast.error(serverErrorMsg, { className: "custom-toast" });
      }
      setErrors({ otp: " " });
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || remainingAttempts <= 0 || isResending) return;

    setIsResending(true);
    const resp = await resendOtp(email);
    setIsResending(false);

    if (resp.success) {
      setResendCooldown(60);
      setRemainingAttempts((prev) => prev - 1);
      toast.success("Kode OTP baru telah berhasil dikirim.", {
        className: "custom-toast",
      });
    } else {
      if (resp.error === "RESEND_TOO_SOON") {
        setResendCooldown(resp.retryAfter || 60);
        toast.error(
          `Harap tunggu ${resp.retryAfter || 60} detik sebelum mengirim ulang.`,
          { className: "custom-toast" }
        );
      } else {
        const serverErrorMsg =
          errorMessages[resp.error] || errorMessages.SERVER_ERROR;
        toast.error(serverErrorMsg, { className: "custom-toast" });
      }
    }
  };

  if (!email) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <DotLoader dotSize="w-5 h-5" />
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
              className="w-auto h-auto max-w-[200px] max-h-[80px] object-cover"
            />
          </div>
        </Link>
      </div>
      <div className="flex flex-col justify-center pt-5 w-full max-w-md mx-auto">
        <div className="text-center">
          <TittleText
            text="Verifikasi Akun Anda"
            className="text-2xl md:text-3xl"
          />
          <p className="mt-2 text-gray-600">
            Kami telah mengirimkan kode 6 digit ke alamat email <br />
            <span className="font-semibold text-gray-800">{email}</span>
          </p>
        </div>

        {displayError && (
          <p className="text-xs text-red-500 text-center mt-4 mb-2 p-2 bg-red-50 border border-red-200 rounded">
            {displayError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <div
            className="flex justify-center gap-2 md:gap-4"
            onPaste={handlePaste}
          >
            {otp.map((value, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={value}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-medium text-gray-700 bg-white border rounded-lg placeholder-gray-400/70 focus:outline-none transition ${
                  errors.otp || displayError
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-orange-300"
                }`}
              />
            ))}
          </div>

          <div className="mt-1 min-h-[1rem] text-center">
            {errors.otp && <p className="text-xs text-red-500">{errors.otp}</p>}
          </div>

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
            {resendCooldown > 0 ? (
              <span className="text-gray-500">
                Kirim ulang lagi dalam {resendCooldown} detik
              </span>
            ) : (
              <button
                onClick={handleResend}
                disabled={loading || isResending || remainingAttempts <= 0}
                className="inline-flex items-center gap-1 font-medium text-orange-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                {isResending && <Loader2 className="w-4 h-4 animate-spin" />}
                Kirim ulang{" "}
                {remainingAttempts > 0 ? `(${remainingAttempts})` : ""}
              </button>
            )}
          </p>
          {remainingAttempts <= 0 && resendCooldown <= 0 && (
            <p className="text-xs text-red-500 mt-1">
              Batas kirim ulang OTP telah tercapai.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
