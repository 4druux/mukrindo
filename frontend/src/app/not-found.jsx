"use client";
import ButtonMagnetic from "@/components/common/ButtonMagnetic";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-orange-500">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-6xl font-extrabold"
        >
          404
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-2 text-xl font-medium text-gray-500"
        >
          Halaman Tidak Ditemukan
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-4 text-gray-500"
        >
          Halaman
          <span className="text-gray-700 tracking-wider">"{pathname}"</span>
          yang Anda cari sepertinya tidak tersedia. Tapi tenang, Anda selalu
          bisa kembali ke beranda untuk melanjutkan.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            delay: 0.9,
            type: "spring",
            stiffness: 120,
          }}
          className="mt-6"
        >
          <ButtonMagnetic
            onClick={() => router.back("/")}
            icon={<IoArrowBack className="w-5 h-5" />}
          >
            Kembali
          </ButtonMagnetic>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 0.5, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-6 text-xs text-gray-500"
      >
        Mukrindo Motor - Mobil bekas terbaik dan terpercaya 🚀
      </motion.div>
    </div>
  );
}
