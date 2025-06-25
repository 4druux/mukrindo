"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import TittleText from "@/components/common/TittleText";
import InputPassword from "@/components/common/InputPassword";
import ButtonAction from "@/components/common/ButtonAction";
import { useParams } from "next/navigation";

export default function ResetPasswordForm() {
  const params = useParams();
  const { token } = params;
  const { resetPassword, loading, authError, setAuthError } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setErrors({});

    const newErrors = {};
    if (password.length < 8) {
      newErrors.password = "Kata sandi minimal 8 karakter.";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi kata sandi tidak cocok.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await resetPassword(token, password);
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
        <div className="mb-2 md:mb-5 text-left">
          <TittleText
            text="Reset Kata Sandi Anda"
            className="text-xl md:text-2xl"
          />
        </div>
        <div>
          <p className="mb-6 text-sm text-gray-600">
            Masukkan kata sandi baru Anda di bawah ini.
          </p>
          {authError && (
            <p className="text-xs text-red-500 text-center mb-4 p-2 bg-red-50 border border-red-200 rounded">
              {authError}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <InputPassword
                label="Kata Sandi Baru"
                id="password-reset"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi baru"
                autoComplete="new-password"
                error={errors.password}
              />
              <InputPassword
                label="Konfirmasi Kata Sandi Baru"
                id="confirm-password-reset"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi kata sandi baru"
                autoComplete="new-password"
                error={errors.confirmPassword}
              />
              <div>
                <ButtonAction
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Reset Kata Sandi"
                  )}
                </ButtonAction>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
