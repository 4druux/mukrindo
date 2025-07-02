"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import TittleText from "@/components/common/TittleText";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";

const policyData = [
  {
    id: "pendahuluan",
    title: "1. Pendahuluan",
    content: [
      "Selamat datang di Mukrindo Motor. Kami berkomitmen untuk melindungi privasi dan keamanan informasi pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan melindungi informasi Anda saat Anda mengunjungi situs web kami dan menggunakan layanan kami. Dengan menggunakan layanan kami, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini.",
    ],
  },
  {
    id: "pengumpulan_informasi",
    title: "2. Informasi yang Kami Kumpulkan",
    content: [
      "Kami mengumpulkan berbagai jenis informasi sehubungan dengan layanan yang kami sediakan, yang dapat dikelompokkan sebagai berikut:",
      "Informasi yang Anda Berikan Secara Langsung:",
      {
        type: "unordered",
        items: [
          "Data Pendaftaran Akun: Saat Anda membuat akun, kami mengumpulkan nama depan, nama belakang, alamat email, dan kata sandi Anda. Jika Anda mendaftar menggunakan Google, kami menerima informasi profil dasar dari akun Google Anda.",
          "Data Profil: Anda dapat memberikan informasi tambahan pada profil Anda, seperti mengunggah foto profil.",
          "Data Transaksi dan Layanan: Saat Anda menggunakan layanan jual, beli, atau tukar tambah, kami mengumpulkan informasi detail terkait kendaraan, data kontak, serta informasi untuk jadwal inspeksi.",
          "Data Komunikasi: Kami menyimpan informasi yang Anda berikan saat menghubungi layanan pelanggan kami.",
        ],
      },
      "Informasi yang Dikumpulkan Secara Otomatis:",
      {
        type: "unordered",
        items: [
          "Data Log dan Penggunaan: Kami secara otomatis mencatat alamat IP, jenis browser, sistem operasi, halaman yang Anda kunjungi, dan durasi kunjungan.",
          "Data Interaksi: Kami melacak interaksi Anda dengan platform, seperti mobil yang Anda lihat, untuk memberikan rekomendasi produk yang relevan.",
          "Cookie dan Teknologi Serupa: Kami menggunakan cookie untuk mengelola sesi login, mengingat preferensi, dan analisis trafik.",
        ],
      },
    ],
  },
  {
    id: "penggunaan_informasi",
    title: "3. Kami Menggunakan Informasi Anda",
    content: [
      "Informasi yang kami kumpulkan digunakan untuk berbagai tujuan:",
      {
        type: "ordered",
        items: [
          "Menyediakan dan Memelihara Layanan: Untuk mengoperasikan situs web, mengelola akun Anda, serta memproses permintaan jual, beli, dan tukar tambah mobil.",
          "Personalisasi Pengalaman: Untuk memberikan rekomendasi produk yang mungkin menarik bagi Anda.",
          "Komunikasi: Untuk mengirimkan notifikasi layanan, pembaruan, informasi pemasaran, serta menanggapi permintaan dukungan Anda.",
          "Peningkatan dan Pengembangan: Kami menganalisis data untuk meningkatkan fungsionalitas dan mengembangkan fitur baru.",
          "Keamanan: Untuk memantau aktivitas mencurigakan atau penipuan dan melindungi platform.",
          "Kepatuhan Hukum: Untuk mematuhi kewajiban hukum yang berlaku.",
        ],
      },
    ],
  },
  {
    id: "berbagi_informasi",
    title: "4. Pembagian Informasi",
    content: [
      "Kami tidak akan menyewakan atau menjual informasi pribadi Anda. Kami dapat membagikan informasi Anda dalam situasi terbatas berikut:",
      {
        type: "unordered",
        items: [
          "Dengan Penyedia Layanan: Kami bekerja sama dengan pihak ketiga untuk memfasilitasi layanan kami.",
          "Untuk Tujuan Hukum: Jika diwajibkan oleh hukum atau permintaan resmi dari otoritas publik.",
          "Untuk Melindungi Hak Kami: Untuk melindungi hak, properti, atau keamanan Mukrindo Motor dan pengguna kami.",
          "Transaksi Bisnis: Jika terjadi merger atau akuisisi, informasi Anda dapat ditransfer sebagai aset bisnis.",
          "Dengan Persetujuan Anda: Untuk tujuan lain dengan persetujuan eksplisit dari Anda.",
        ],
      },
    ],
  },
  {
    id: "penyimpanan_data",
    title: "5. Penyimpanan dan Retensi Data",
    content: [
      "Kami akan menyimpan informasi pribadi Anda hanya selama diperlukan untuk tujuan yang ditetapkan dalam Kebijakan Privasi ini. Data akan disimpan selama akun Anda aktif atau sejauh yang diperlukan untuk mematuhi kewajiban hukum, menyelesaikan perselisihan, dan menegakkan kebijakan kami.",
    ],
  },
  {
    id: "keamanan_informasi",
    title: "6. Keamanan Informasi",
    content: [
      "Keamanan informasi Anda penting bagi kami. Kami menerapkan langkah-langkah teknis dan organisasi yang wajar untuk melindungi data Anda, termasuk enkripsi kata sandi dan penggunaan token otentikasi. Meskipun demikian, tidak ada metode transmisi atau penyimpanan elektronik yang 100% aman.",
    ],
  },
  {
    id: "hak_anda",
    title: "7. Hak-Hak Anda sebagai Pengguna",
    content: [
      "Anda memiliki hak tertentu terkait informasi pribadi Anda, termasuk hak untuk:",
      {
        type: "unordered",
        items: [
          "Mengakses, memperbarui, atau menghapus informasi yang kami miliki tentang Anda.",
          "Memperbaiki informasi yang tidak akurat atau tidak lengkap.",
          "Menolak pemrosesan informasi pribadi Anda untuk tujuan tertentu.",
          "Meminta pembatasan pemrosesan informasi pribadi Anda.",
        ],
      },
      "Untuk menggunakan hak-hak ini, silakan hubungi kami melalui informasi kontak yang disediakan.",
    ],
  },
  {
    id: "kebijakan_cookie",
    title: "8. Kebijakan Cookie",
    content: [
      "Layanan kami menggunakan cookie dan teknologi pelacakan serupa untuk meningkatkan pengalaman Anda, menganalisis penggunaan, dan memberikan fungsionalitas. Cookie adalah file data kecil yang disimpan di perangkat Anda.",
      "Jenis Cookie yang Kami Gunakan:",
      {
        type: "unordered",
        items: [
          "Cookie Esensial (Wajib): Cookie ini sangat penting agar layanan kami dapat berfungsi dengan baik. Ini termasuk cookie untuk otentikasi pengguna, manajemen sesi login, dan memastikan keamanan platform. Anda tidak dapat menonaktifkan cookie ini karena layanan tidak akan berfungsi tanpanya.",
          "Cookie Analitik dan Kinerja: Cookie ini membantu kami memahami bagaimana pengunjung berinteraksi dengan layanan kami dengan mengumpulkan informasi secara anonim. Kami menggunakan data ini untuk menganalisis lalu lintas, mengidentifikasi halaman populer, dan mendeteksi masalah teknis, sehingga kami dapat terus meningkatkan platform kami. Contohnya termasuk cookie dari Google Analytics.",
          "Cookie Fungsionalitas: Cookie ini digunakan untuk mengingat pilihan yang Anda buat (seperti nama pengguna, bahasa, atau wilayah) dan menyediakan fitur yang lebih personal. Misalnya, kami dapat menyimpan preferensi tampilan Anda sehingga Anda tidak perlu mengaturnya setiap kali berkunjung.",
        ],
      },
      "Anda dapat mengontrol dan mengelola cookie melalui pengaturan browser Anda. Anda bisa mengatur browser untuk menolak semua cookie atau memberi tahu Anda saat cookie dikirim. Namun, perlu diingat bahwa jika Anda menonaktifkan cookie, beberapa bagian dari layanan kami mungkin tidak berfungsi sebagaimana mestinya.",
    ],
  },
  {
    id: "privasi_anak",
    title: "9. Privasi Anak-Anak",
    content: [
      "Layanan kami secara tegas tidak ditujukan untuk individu yang berusia di bawah 18 tahun ('Anak-Anak'). Kami memiliki komitmen kuat untuk melindungi privasi anak-anak. Kami tidak secara sengaja atau sadar mengumpulkan Informasi Identitas Pribadi (PII) dari siapa pun di bawah usia 18 tahun.",
      "Jika Anda adalah orang tua atau wali dan Anda mengetahui bahwa anak Anda telah memberikan kami Informasi Pribadi tanpa persetujuan Anda, kami mohon Anda segera menghubungi kami. Setelah menerima pemberitahuan tersebut, kami akan mengambil langkah-langkah yang diperlukan untuk memverifikasi informasi tersebut.",
      "Jika kami mengetahui atau memverifikasi bahwa kami telah secara tidak sengaja mengumpulkan Informasi Pribadi dari seorang anak tanpa adanya persetujuan orang tua yang sah, kami akan segera menghapus informasi tersebut dari server dan catatan kami sebagai bagian dari prosedur kepatuhan kami.",
    ],
  },
  {
    id: "transfer_data",
    title: "10. Transfer Data Internasional",
    content: [
      "Informasi Anda, termasuk data pribadi, dapat ditransfer ke—dan dipelihara di—komputer atau server yang berlokasi di luar negara bagian, provinsi, negara, atau yurisdiksi pemerintah Anda. Perlu diketahui bahwa undang-undang perlindungan data di yurisdiksi tersebut mungkin berbeda dari yang ada di yurisdiksi Anda.",
      "Penyedia layanan pihak ketiga kami, seperti platform hosting atau layanan cloud, mungkin memiliki server di berbagai negara. Oleh karena itu, data Anda mungkin diproses di negara tempat mereka beroperasi.",
      "Persetujuan Anda terhadap Kebijakan Privasi ini, yang diikuti dengan penyerahan informasi tersebut, merupakan persetujuan Anda yang tegas atas transfer tersebut. Mukrindo Motor akan mengambil semua langkah yang wajar dan diperlukan untuk memastikan bahwa data Anda diperlakukan dengan aman dan sesuai dengan Kebijakan Privasi ini. Kami tidak akan mentransfer data pribadi Anda ke organisasi atau negara mana pun kecuali ada kontrol yang memadai, termasuk keamanan data dan perlindungan privasi lainnya.",
    ],
  },
  {
    id: "perubahan_kebijakan",
    title: "11. Perubahan Kebijakan Privasi",
    content: [
      "Kami dapat memperbarui Kebijakan Privasi kami dari waktu ke waktu untuk mencerminkan perubahan pada praktik kami atau karena alasan operasional, hukum, atau peraturan lainnya. Ketika kami melakukan perubahan, kami akan mempublikasikan versi terbaru di halaman ini.",
      "Kami akan memberi tahu Anda tentang perubahan material apa pun dengan memposting pemberitahuan yang jelas di situs web kami atau, jika sesuai, dengan mengirimkan pemberitahuan langsung kepada Anda melalui email sebelum perubahan tersebut berlaku. Kami juga akan memperbarui tanggal 'Terakhir Diperbarui' di bagian atas Kebijakan Privasi ini.",
      "Anda dianjurkan untuk meninjau Kebijakan Privasi ini secara berkala untuk setiap perubahan. Perubahan pada Kebijakan Privasi ini efektif pada saat diposting di halaman ini. Penggunaan Anda yang berkelanjutan atas layanan kami setelah pembaruan tersebut merupakan penerimaan Anda terhadap kebijakan yang direvisi.",
    ],
  },
  {
    id: "hubungi_kami",
    title: "12. Hubungi Kami",
    content: [
      "Kami menyambut baik pertanyaan, komentar, dan kekhawatiran Anda mengenai Kebijakan Privasi ini atau praktik data kami. Jika Anda ingin menggunakan hak privasi Anda, memerlukan klarifikasi lebih lanjut, atau memiliki keluhan, jangan ragu untuk menghubungi kami melalui salah satu saluran berikut:",
      "Kontak Utama (Email):",
      {
        type: "unordered",
        items: [
          "Untuk pertanyaan umum, permintaan terkait hak privasi Anda (seperti akses, perbaikan, atau penghapusan data), atau masalah lainnya, silakan kirim email ke: support@demoshowroom.com.",
          "Untuk mempercepat respons kami, mohon sertakan nama lengkap Anda, informasi kontak yang dapat kami hubungi, dan deskripsi terperinci mengenai pertanyaan atau permintaan Anda. Ini akan membantu kami untuk memverifikasi identitas Anda dan menangani permintaan Anda secara lebih efisien.",
        ],
      },
      "Tim kami akan berusaha menanggapi pertanyaan Anda sesegera mungkin, biasanya dalam beberapa hari kerja. Kami berkomitmen untuk bekerja sama dengan Anda guna mencapai penyelesaian yang adil atas setiap keluhan atau masalah terkait privasi.",
    ],
  },
];

const NAV_ITEM_TOTAL_HEIGHT = 35.5;
const BAR_HEIGHT = 24;
const VERTICAL_OFFSET = (NAV_ITEM_TOTAL_HEIGHT - BAR_HEIGHT) / 2;
const HEADER_OFFSET = 100;

export default function PrivacyPolicy() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef([]);

  if (sectionRefs.current.length !== policyData.length) {
    sectionRefs.current = Array(policyData.length)
      .fill()
      .map((_, i) => sectionRefs.current[i] || React.createRef());
  }

  useEffect(() => {
    const handleScroll = () => {
      const distances = sectionRefs.current.map((ref) => {
        if (!ref.current) return Infinity;
        const rect = ref.current.getBoundingClientRect();
        return Math.abs(rect.top - HEADER_OFFSET);
      });
      const idx = distances.indexOf(Math.min(...distances));
      if (idx !== activeIndex) {
        setActiveIndex(idx);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeIndex]);

  const lockedTop = activeIndex * NAV_ITEM_TOTAL_HEIGHT + VERTICAL_OFFSET;

  const scrollToSection = (id, idx) => {
    setActiveIndex(idx);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <div className="px-3 md:px-0">
      <BreadcrumbNav
        items={[
          { label: "Beranda", href: "/" },
          { label: "Kebijakan Privasi", href: "" },
        ]}
      />

      <motion.div initial="hidden" animate="visible" variants={pageVariants}>
        <TittleText text="Kebijakan Privasi" />
        <p className="text-xs xl:text-sm text-gray-500 mb-6">
          Kami berkomitmen untuk melindungi privasi dan keamanan data Anda.
        </p>

        <div className="w-full flex items-start gap-4">
          <main className="w-full xl:w-4/5">
            {policyData.map((section, idx) => (
              <motion.section
                key={section.id}
                id={section.id}
                ref={sectionRefs.current[idx]}
                custom={idx}
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                style={{ scrollMarginTop: `${HEADER_OFFSET}px` }}
                className={clsx(idx !== policyData.length - 1 && "mb-6")}
              >
                <h3 className="text-sm xl:text-md font-semibold text-gray-600">
                  {section.title}
                </h3>
                <div>
                  {!Array.isArray(section.content) ? (
                    <p className="text-xs xl:text-sm leading-relaxed text-gray-700">
                      {section.content}
                    </p>
                  ) : (
                    section.content.map((el, i) => {
                      if (typeof el === "string") {
                        return (
                          <p
                            key={i}
                            className="text-xs xl:text-sm leading-relaxed text-gray-700 mt-2"
                          >
                            {el}
                          </p>
                        );
                      }
                      if (el.type === "ordered") {
                        return (
                          <ol
                            key={i}
                            className="list-decimal list-inside text-xs xl:text-sm ml-4 space-y-2 mt-2 text-gray-700"
                          >
                            {el.items.map((it, j) => (
                              <li key={j}>{it}</li>
                            ))}
                          </ol>
                        );
                      }
                      return (
                        <ul
                          key={i}
                          className="list-disc list-inside text-xs xl:text-sm ml-4 space-y-2 mt-2 text-gray-700"
                        >
                          {el.items.map((it, j) => (
                            <li key={j}>{it}</li>
                          ))}
                        </ul>
                      );
                    })
                  )}
                </div>
              </motion.section>
            ))}
          </main>

          <aside className="hidden xl:block xl:w-1/4 sticky top-24">
            <h4 className="font-medium text-gray-600 mb-4">Navigasi</h4>
            <div className="relative pl-3">
              <motion.div
                className="absolute left-0 w-1.5 bg-orange-400 rounded-full"
                style={{ height: BAR_HEIGHT }}
                animate={{ top: lockedTop }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <ul className="flex flex-col gap-3">
                {policyData.map((sec, i) => (
                  <li key={sec.id} className="h-6 flex items-center">
                    <a
                      href={`#${sec.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(sec.id, i);
                      }}
                      className={clsx(
                        "transition-all duration-300 text-sm xl:text-md font-medium",
                        activeIndex === i
                          ? "text-gray-600 font-semibold"
                          : "text-gray-400 hover:text-gray-700 hover:translate-x-1"
                      )}
                    >
                      {sec.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  );
}
