// frontend/src/app/auth/callback/page.jsx
"use client";
import { useEffect, useState } from "react"; // useState untuk pesan dinamis jika perlu
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import DotLoader from "@/components/common/DotLoader";
import Link from "next/link";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { handleOAuthSuccess } = useAuth(); // Ini untuk alur login sukses
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
      // **PENANGANAN BARU UNTUK AKSES ADMIN DITOLAK**
      setPageMessage("Akses ditolak. Mengalihkan..."); // Ubah pesan di halaman callback
      const displayMessage =
        messageFromParams ||
        "Anda tidak memiliki izin untuk mengakses halaman ini.";
      toast.error(displayMessage, { className: "custom-toast" });

      // Penting: JANGAN panggil handleOAuthSuccess atau logout.
      // Sesi user tetap ada. Langsung redirect ke homepage.
      // Tambahkan delay kecil jika ingin loader dan pesan di callback page terlihat lebih lama.
      const redirectTimer = setTimeout(() => {
        router.replace("/");
      }, 1500); // Delay 1.5 detik (sesuaikan atau hapus jika tidak perlu delay)

      return () => clearTimeout(redirectTimer); // Cleanup timer jika komponen unmount
    } else if (token && role && userId && email) {
      // Logika yang sudah ada untuk login sukses (OAuth atau manual)
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
      // Hanya jika tidak ada errorType spesifik yang ditangani
      // Parameter tidak lengkap untuk login sukses
      console.error(
        "Auth callback: Parameter login sukses tidak lengkap.",
        Object.fromEntries(searchParams)
      );
      toast.error("Login gagal: Informasi login tidak lengkap.", {
        className: "custom-toast",
      });
      router.replace("/login?error=incomplete_login_params");
    }
    // Jika ada errorType lain yang tidak ditangani, tidak akan melakukan apa-apa,
    // pengguna akan tetap di halaman callback dengan loader.
    // Anda bisa menambahkan penanganan error default di sini jika perlu.

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
