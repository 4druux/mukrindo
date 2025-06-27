"use client";
import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import TittleText from "@/components/common/TittleText";
import InputPassword from "@/components/common/InputPassword";
import ButtonAction from "@/components/common/ButtonAction";
import Link from "next/link";
import Image from "next/image";

export default function ResetPasswordForm() {
  const { token } = useParams();
  const pathname = usePathname();
  const { resetPassword, loading, authError, setAuthError } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setErrors({});
    setAuthError(null);
  }, [pathname, setAuthError]);

  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    if (authError) setAuthError(null);
  };

  const errorMessages = {
    INVALID_TOKEN: "Token tidak valid atau sudah kedaluwarsa.",
    SERVER_ERROR: "Gagal mereset kata sandi. Silakan coba lagi.",
  };
  const displayError = authError ? errorMessages[authError] : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setErrors({});

    const newErrors = {};
    if (!password) newErrors.password = "Kata sandi wajib diisi.";
    else if (password.length < 8)
      newErrors.password = "Kata sandi minimal 8 karakter.";
    if (!confirmPassword) newErrors.confirmPassword = "Konfirmasi wajib diisi.";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Konfirmasi kata sandi tidak cocok.";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      toast.error("Harap periksa kembali data Anda.", {
        className: "custom-toast",
      });
      return;
    }

    const resp = await resetPassword(token, password);
    if (!resp.success) {
      toast.error(displayError || errorMessages.SERVER_ERROR, {
        className: "custom-toast",
      });
    } else {
      toast.success("Kata sandi telah diperbarui. Silakan masuk kembali.", {
        className: "custom-toast",
      });
    }
  };

  return (
    <div className="flex flex-col w-full p-4">
      <div className="w-full max-w-md pt-5 md:pt-10 mx-auto mb-5">
        <Link href="/">
          <Image
            src="/images/logo/mm-logo.png"
            alt="Logo"
            width={130}
            height={35}
            className="mx-auto"
          />
        </Link>
      </div>

      <div className="flex flex-col justify-center pt-5 w-full max-w-md mx-auto">
        <TittleText
          text="Reset Kata Sandi Anda"
          className="text-xl md:text-2xl mb-4"
        />

        {displayError && !loading && (
          <p className="text-xs text-red-500 text-center mb-4 p-2 bg-red-50 border border-red-200 rounded">
            {displayError}
          </p>
        )}

        <p className="mb-6 text-sm text-gray-600">
          Masukkan kata sandi baru Anda di bawah ini.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <InputPassword
              label="Kata Sandi Baru"
              id="password-reset"
              value={password}
              onChange={handleInputChange(setPassword, "password")}
              placeholder="Masukkan kata sandi baru"
              autoComplete="new-password"
              error={errors.password}
            />
          </div>

          <div>
            <InputPassword
              label="Konfirmasi Kata Sandi"
              id="confirm-password-reset"
              value={confirmPassword}
              onChange={handleInputChange(
                setConfirmPassword,
                "confirmPassword"
              )}
              placeholder="Konfirmasi kata sandi baru"
              autoComplete="new-password"
              error={errors.confirmPassword}
            />
          </div>

          <ButtonAction type="submit" disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spinner" />
            ) : (
              "Reset Kata Sandi"
            )}
          </ButtonAction>
        </form>
      </div>
    </div>
  );
}
