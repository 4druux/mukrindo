"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import TittleText from "@/components/common/TittleText";
import BreadcrumbNav from "@/components/common/BreadcrumbNav";

const termsAndConditionsData = [
  {
    id: "pendahuluan",
    title: "1. Pendahuluan",
    content: [
      "Selamat datang di Mukrindo Motor. Dokumen Syarat dan Ketentuan ('Ketentuan') ini merupakan perjanjian hukum yang mengikat antara Anda ('Pengguna') dan Mukrindo Motor ('Kami'), yang mengatur seluruh akses dan penggunaan Anda terhadap situs web, aplikasi, serta layanan terkait ('Layanan') yang kami sediakan. Dengan melakukan akses atau menggunakan Layanan kami, Anda secara tegas menyatakan bahwa Anda telah membaca, memahami, dan setuju untuk terikat sepenuhnya oleh semua Ketentuan yang tercantum dalam dokumen ini serta Kebijakan Privasi kami yang merupakan satu kesatuan tak terpisahkan dari Ketentuan ini.",
      "Apabila Anda tidak dapat menyetujui sebagian atau seluruh dari Ketentuan ini, maka Anda tidak diizinkan untuk mengakses atau melanjutkan penggunaan Layanan kami. Kami memiliki hak prerogatif untuk mengubah, memodifikasi, menambah, atau menghapus bagian dari Ketentuan ini setiap saat tanpa pemberitahuan sebelumnya, sesuai dengan kebijakan internal kami dan perkembangan hukum yang berlaku.",
    ],
  },
  {
    id: "penggunaan_layanan",
    title: "2. Penggunaan Layanan",
    content: [
      "Anda dengan ini setuju dan berkomitmen untuk menggunakan Layanan kami secara eksklusif untuk tujuan yang sah, etis, dan sesuai dengan seluruh peraturan perundang-undangan yang berlaku di Republik Indonesia serta Ketentuan ini.",
      "Sebagai Pengguna, Anda memegang tanggung jawab penuh dan tanpa terkecuali atas hal-hal berikut:",
      {
        type: "unordered",
        items: [
          "Menjaga kerahasiaan dan keamanan kredensial akun Anda, termasuk namun tidak terbatas pada nama pengguna dan kata sandi, dari akses pihak ketiga yang tidak sah.",
          "Setiap dan semua aktivitas, transaksi, dan interaksi yang terjadi di bawah atau melalui akun Anda, baik yang Anda sadari maupun tidak.",
          "Menjamin keakuratan, kelengkapan, dan kemutakhiran seluruh informasi yang Anda berikan kepada kami, termasuk data pribadi, informasi kontak, dan detail spesifikasi kendaraan.",
        ],
      },
      "Anda secara tegas dilarang untuk melakukan tindakan-tindakan berikut:",
      {
        type: "unordered",
        items: [
          "Menyediakan data atau informasi yang palsu, tidak akurat, menyesatkan, atau meniru identitas pihak lain dalam proses registrasi maupun penggunaan Layanan.",
          "Memanfaatkan Layanan untuk melakukan aktivitas penipuan, pencucian uang, atau kegiatan lain yang bertentangan dengan hukum dan peraturan yang berlaku.",
          "Melakukan upaya tidak sah untuk mengakses, meretas, atau mengganggu integritas sistem, jaringan, atau data yang terkait dengan operasional Layanan kami.",
          "Mengunggah, mempublikasikan, atau mendistribusikan konten apa pun yang melanggar hak cipta, merek dagang, paten, rahasia dagang, atau hak kekayaan intelektual lainnya milik pihak ketiga.",
        ],
      },
    ],
  },
  {
    id: "layanan_jual_beli",
    title: "3. Platform dalam Layanan Jual Beli",
    content: [
      "Mukrindo Motor berfungsi sebagai platform digital yang menyediakan sarana untuk memfasilitasi pertemuan antara pihak penjual dan pihak pembeli kendaraan. Perlu dipahami bahwa kami tidak memiliki kepemilikan atas kendaraan yang terdaftar dalam Layanan dan tidak bertindak sebagai pihak yang terlibat langsung dalam transaksi jual beli yang terjadi antara Pengguna.",
      "Sebagai pihak Penjual, Anda menyatakan dan menjamin bahwa seluruh informasi, data, dan deskripsi yang Anda cantumkan terkait kendaraan yang Anda daftarkan adalah benar, akurat, lengkap, dan tidak menyesatkan. Anda juga menjamin bahwa Anda memiliki hak hukum yang penuh dan tidak terhalang untuk menjual kendaraan tersebut.",
      "Sebagai pihak Pembeli, Anda bertanggung jawab sepenuhnya untuk melaksanakan proses uji tuntas (due diligence) secara mandiri dan menyeluruh terhadap setiap kendaraan yang menarik minat Anda sebelum mengambil keputusan pembelian. Proses ini termasuk pemeriksaan fisik, verifikasi dokumen, dan aspek relevan lainnya.",
      "Meskipun Mukrindo Motor dapat memfasilitasi beberapa proses pendukung seperti penjadwalan inspeksi atau komunikasi awal, kami tidak bertanggung jawab atas kondisi aktual kendaraan, keabsahan transaksi, legalitas dokumen, maupun tindakan atau kelalaian dari Pengguna lain dalam platform.",
    ],
  },
  {
    id: "kekayaan_intelektual",
    title: "4. Hak Kekayaan Intelektual",
    content: [
      "Seluruh komponen Layanan kami, termasuk namun tidak terbatas pada kode sumber, teks, grafis, logo, ikon tombol, gambar, klip audio, kompilasi data, dan perangkat lunak, merupakan properti eksklusif milik Mukrindo Motor atau para pemberi lisensinya. Seluruh konten tersebut dilindungi oleh undang-undang hak cipta, merek dagang, dan kekayaan intelektual lainnya yang berlaku di Indonesia dan yurisdiksi internasional.",
      "Anda dilarang keras untuk mereproduksi, mendistribusikan, memodifikasi, menampilkan di depan umum, menyiarkan, atau menciptakan karya turunan dari setiap bagian konten kami tanpa memperoleh persetujuan tertulis yang eksplisit dan terdokumentasi dari Mukrindo Motor.",
    ],
  },
  {
    id: "pembatasan_tanggung_jawab",
    title: "5. Pembatasan Tanggung Jawab",
    content: [
      "Layanan kami disediakan kepada Anda atas dasar 'sebagaimana adanya' dan 'sebagaimana tersedia'. Kami tidak memberikan jaminan, baik secara tersurat maupun tersirat, dalam bentuk apa pun, termasuk jaminan bahwa Layanan akan selalu aman, bebas dari eror, berfungsi tanpa gangguan, atau memenuhi ekspektasi spesifik Anda.",
      "Sejauh yang diizinkan oleh hukum yang berlaku, Mukrindo Motor, termasuk direksi, pejabat, karyawan, dan afiliasinya, tidak akan bertanggung jawab atas segala bentuk kerugian, baik yang bersifat tidak langsung, insidental, khusus, konsekuensial, atau bersifat hukuman. Ini mencakup, namun tidak terbatas pada, kehilangan keuntungan, data, penggunaan, goodwill, atau kerugian tidak berwujud lainnya, yang timbul sebagai akibat dari:",
      {
        type: "ordered",
        items: [
          "Akses Anda, penggunaan Anda, atau ketidakmampuan Anda untuk mengakses atau menggunakan Layanan.",
          "Setiap tindakan, perilaku, atau konten dari pihak ketiga mana pun yang ada di dalam Layanan, termasuk pengguna lain.",
          "Setiap konten atau informasi yang diperoleh dari Layanan yang Anda gunakan sebagai dasar pengambilan keputusan.",
          "Akses, penggunaan, atau perubahan yang tidak sah terhadap transmisi data atau konten Anda oleh pihak lain.",
        ],
      },
    ],
  },
  {
    id: "ganti_rugi",
    title: "6. Ganti Rugi",
    content: [
      "Anda setuju untuk membela, memberikan ganti rugi, dan membebaskan Mukrindo Motor beserta seluruh afiliasi, pejabat, direktur, karyawan, dan agennya dari dan terhadap setiap dan semua klaim, kerusakan, kewajiban, kerugian, ongkos, atau utang, serta pengeluaran (termasuk namun tidak terbatas pada biaya hukum yang wajar), yang timbul dari atau sehubungan dengan: (i) penggunaan dan akses Anda ke Layanan; (ii) pelanggaran Anda terhadap salah satu ketentuan dalam Ketentuan ini; (iii) pelanggaran Anda terhadap hak pihak ketiga mana pun, termasuk hak cipta, properti, atau hak privasi; atau (iv) setiap klaim bahwa konten yang Anda serahkan menyebabkan kerugian pada pihak ketiga. Kewajiban ganti rugi ini akan tetap berlaku meskipun Ketentuan ini berakhir atau setelah Anda berhenti menggunakan Layanan.",
    ],
  },
  {
    id: "penghentian_akun",
    title: "7. Penangguhan Akun",
    content: [
      "Kami berhak, atas kebijakan kami sendiri, untuk menangguhkan atau menghentikan akses Anda ke seluruh atau sebagian Layanan kami dengan segera, tanpa pemberitahuan atau kewajiban sebelumnya, untuk alasan apa pun, termasuk namun tidak terbatas pada jika Anda terbukti melanggar Ketentuan ini secara material.",
      "Setelah penghentian tersebut, hak Anda untuk menggunakan Layanan akan serta-merta berakhir. Jika Anda berkeinginan untuk menghentikan akun Anda, Anda dapat secara sederhana berhenti menggunakan Layanan atau mengajukan permohonan penutupan akun melalui kanal dukungan yang kami sediakan.",
    ],
  },
  {
    id: "hukum_yang_berlaku",
    title: "8. Hukum Berlaku dan Penyelesaian",
    content: [
      "Ketentuan ini akan diatur dan ditafsirkan sesuai dengan hukum yang berlaku di wilayah yurisdiksi Republik Indonesia, tanpa memperhatikan pertentangan ketentuan hukum yang mungkin mengarahkan pada penerapan hukum dari yurisdiksi lain.",
      "Setiap sengketa, kontroversi, atau klaim yang timbul dari atau terkait dengan Ketentuan ini, termasuk pelanggaran, penghentian, atau keabsahannya, akan diupayakan untuk diselesaikan terlebih dahulu melalui musyawarah untuk mencapai mufakat. Apabila mufakat tidak tercapai dalam jangka waktu yang wajar, maka sengketa tersebut akan diselesaikan secara eksklusif melalui yurisdiksi pengadilan yang kompeten di Jakarta.",
    ],
  },
  {
    id: "kontak",
    title: "9. Informasi Kontak",
    content: [
      "Apabila Anda memiliki pertanyaan, klarifikasi, atau membutuhkan informasi lebih lanjut mengenai Syarat dan Ketentuan ini, silakan menghubungi tim dukungan kami melalui alamat email resmi di support@demoshowroom.com. Kami akan berusaha menanggapi pertanyaan Anda sesegera mungkin.",
    ],
  },
  {
    id: "perubahan_ketentuan",
    title: "10. Amandemen Ketentuan",
    content: [
      "Kami berhak, atas kebijakan tunggal kami, untuk mengubah, memodifikasi, atau memperbarui Ketentuan ini dari waktu ke waktu untuk merefleksikan perubahan pada praktik bisnis kami, perkembangan teknologi, atau persyaratan hukum dan peraturan. Setiap perubahan akan dipublikasikan secara resmi di halaman ini dan akan berlaku efektif segera setelah tanggal pembaruan dicantumkan.",
      "Anda disarankan untuk meninjau halaman Ketentuan ini secara berkala. Penggunaan Anda yang berkelanjutan atas Layanan kami setelah setiap perubahan tersebut dipublikasikan merupakan bentuk penerimaan dan persetujuan Anda yang tidak dapat ditarik kembali terhadap Ketentuan yang telah direvisi.",
    ],
  },
  {
    id: "keadaan_memaksa",
    title: "11. Keadaan Memaksa",
    content: [
      "Mukrindo Motor tidak akan dianggap bertanggung jawab atau lalai atas setiap kegagalan atau keterlambatan dalam memenuhi kewajiban yang diatur dalam Ketentuan ini, apabila kegagalan atau keterlambatan tersebut secara langsung disebabkan oleh peristiwa di luar kendali wajar kami. Peristiwa tersebut mencakup, namun tidak terbatas pada, bencana alam (seperti kebakaran, banjir, gempa bumi), perang, tindakan terorisme, kerusuhan sipil, pemberontakan, epidemi, pandemi, embargo, pemogokan kerja, gangguan signifikan pada infrastruktur internet atau telekomunikasi, atau tindakan pemerintah ('Keadaan Memaksa').",
      "Dalam hal terjadinya Keadaan Memaksa, pihak yang terkena dampak wajib segera memberitahukan pihak lainnya secara tertulis dan akan mengambil semua langkah yang wajar dan praktis untuk meminimalkan dampak dari kejadian tersebut terhadap pelaksanaan kewajibannya.",
    ],
  },
  {
    id: "ketentuan_umum",
    title: "12. Ketentuan Umum",
    content: [
      "Ketentuan ini, yang harus dibaca bersama dengan Kebijakan Privasi kami, merupakan keseluruhan perjanjian (entire agreement) antara Anda dan Mukrindo Motor sehubungan dengan penggunaan Layanan kami, dan menggantikan semua perjanjian, komunikasi, atau representasi sebelumnya, baik lisan maupun tulisan.",
      {
        type: "unordered",
        items: [
          "Jika ada ketentuan dalam Ketentuan ini yang oleh pengadilan atau badan hukum yang kompeten dianggap tidak sah, ilegal, atau tidak dapat dilaksanakan, maka ketentuan tersebut akan dianggap terpisah dari Ketentuan ini dan ketentuan lainnya akan tetap berlaku dan memiliki kekuatan hukum penuh.",
          "Kegagalan atau penundaan oleh Mukrindo Motor dalam menegakkan hak, kuasa, atau upaya hukum apa pun berdasarkan Ketentuan ini tidak akan dianggap sebagai pengabaian (waiver) atas hak tersebut, juga tidak akan menghalangi penegakan hak tersebut di kemudian hari.",
          "Anda tidak dapat mengalihkan, mendelegasikan, atau mentransfer hak atau kewajiban Anda berdasarkan Ketentuan ini tanpa persetujuan tertulis sebelumnya dari Mukrindo Motor.",
          "Mukrindo Motor berhak untuk mengalihkan atau mensubkontrakkan hak dan kewajibannya berdasarkan Ketentuan ini kepada afiliasi atau pihak ketiga mana pun tanpa pemberitahuan atau persetujuan dari Anda.",
        ],
      },
    ],
  },
];

const NAV_ITEM_TOTAL_HEIGHT = 35.5;
const BAR_HEIGHT = 24;
const VERTICAL_OFFSET = (NAV_ITEM_TOTAL_HEIGHT - BAR_HEIGHT) / 2;
const HEADER_OFFSET = 100;

export default function TermsAndConditions() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef([]);

  // inisialisasi refs
  if (sectionRefs.current.length !== termsAndConditionsData.length) {
    sectionRefs.current = Array(termsAndConditionsData.length)
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
          { label: "Syarat & Ketentuan", href: "" },
        ]}
      />

      <motion.div initial="hidden" animate="visible" variants={pageVariants}>
        <TittleText text="Syarat & Ketentuan" />
        <p className="text-xs xl:text-sm text-gray-500 mb-6">
          Syarat dan ketentuan layanan Demoshowroom
        </p>

        <div className="w-full flex items-start gap-4">
          <main className="w-full xl:w-4/5">
            {termsAndConditionsData.map((section, idx) => (
              <motion.section
                key={section.id}
                id={section.id}
                ref={sectionRefs.current[idx]}
                custom={idx}
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                style={{ scrollMarginTop: `${HEADER_OFFSET}px` }}
                className={clsx(
                  idx !== termsAndConditionsData.length - 1 && "mb-6"
                )}
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
                {termsAndConditionsData.map((sec, i) => (
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
