"use client";

import React, { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Accordion from "@/components/common/Accordion";
import TittleText from "@/components/common/TittleText";

const BuyAccordion = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const handleToggle = (index) => {
    setOpenIndex((prevOpenIndex) => (prevOpenIndex === index ? null : index));
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const accordionItems = [
    {
      title: "Apa saja yang harus dilakukan pada tahap awal jual mobil?",
      description: [
        "Pada tahap ini, Anda diminta untuk memasukkan detail lengkap mengenai mobil yang akan dijual.",
        "Informasi yang dibutuhkan meliputi:",
        {
          type: "unordered",
          items: [
            "Merek Mobil",
            "Model Mobil",
            "Varian Mobil",
            "Jenis Transmisi",
            "Warna Mobil",
            "Tahun Pembuatan",
            "Tanggal Berakhir STNK",
            "Jarak Tempuh (Kilometer)",
            "Harga Penawaran",
          ],
        },
      ],
    },
    {
      title: "Apa saja yang harus dilakukan pada tahap kedua jual mobil?",
      description: [
        "Selanjutnya, kami memerlukan data diri Anda agar tim kami dapat menghubungi Anda terkait proses penjualan mobil.",
        "Isilah informasi berikut:",
        {
          type: "unordered",
          items: [
            "Nama Lengkap sesuai STNK",
            "Nomor Handphone aktif (Format: (+62) 8xxxxxxxxxx)",
            "Alamat Email aktif",
          ],
        },
      ],
    },
    {
      title: "Apa saja yang harus dilakukan pada tahap akhir jual mobil?",
      description: [
        "Tahap terakhir adalah menentukan di mana dan kapan inspeksi mobil akan dilakukan.",
        "Anda dapat memilih lokasi inspeksi:",
        {
          type: "unordered",
          items: [
            "Di Showroom Mukrindo Motor",
            "Di Rumah Anda: Masukkan detail alamat lengkap (Provinsi, Kota/Kabupaten, Alamat Lengkap).",
          ],
        },
        "Setelah memilih lokasi, tentukan juga:",
        {
          type: "unordered",
          items: [
            "Tanggal Inspeksi yang diinginkan",
            "Jam Inspeksi yang diinginkan",
          ],
        },
        "Pastikan Anda menyetujui Syarat & Ketentuan serta Kebijakan Privasi sebelum mengirimkan formulir.",
      ],
    },
    {
      title:
        "Apa saja dokumen dan kelengkapan yang harus disiapkan sebelum jual mobil?",
      description: [
        "Daftar dokumen dan kelengkapan yang perlu disiapkan adalah:",
        {
          type: "unordered",
          items: [
            "BPKB (Buku Pemilik Kendaraan Bermotor) asli.",
            "STNK (Surat Tanda Nomor Kendaraan) asli yang masih berlaku.",
            "Faktur pembelian kendaraan (jika ada).",
            "KTP (Kartu Tanda Penduduk) pemilik sesuai BPKB/STNK.",
            "Buku servis dan manual book (jika ada).",
            "Kunci cadangan.",
            "Surat Pelepasan Hak (jika mobil atas nama perusahaan).",
          ],
        },
        "Pastikan semua dokumen lengkap dan sah untuk memperlancar proses penjualan.",
      ],
    },
    {
      title: "Apakah ada syarat dan ketentuan untuk mobil yang dijual?",
      description: [
        "Syarat dan ketentuan untuk mobil yang dijual meliputi:",
        {
          type: "unordered",
          items: [
            "Mobil bukan bekas tabrakan besar atau terendam banjir.",
            "Dokumen kendaraan lengkap, sah, dan tidak dalam sengketa hukum.",
            "Nomor rangka dan nomor mesin sesuai dengan dokumen.",
            "Pajak kendaraan (STNK) masih berlaku atau dapat diurus.",
            "Usia dan kondisi mobil mungkin menjadi pertimbangan.",
          ],
        },
        "Formulir pengajuan di Langkah 1 (Merek, Model, Tahun, dll.) juga merupakan bagian dari kriteria awal.",
      ],
    },
    {
      title: "Apakah jual mobil di Mukrindo Motor aman?",
      description: [
        "Keamanan transaksi adalah prioritas. Platform jual beli mobil yang terpercaya biasanya menawarkan:",
        {
          type: "unordered",
          items: [
            "Proses inspeksi yang transparan.",
            "Penawaran harga yang wajar berdasarkan kondisi mobil.",
            "Proses pembayaran yang jelas dan terdokumentasi.",
            "Bantuan dalam pengurusan dokumen.",
          ],
        },
        "Untuk memastikan keamanan bertransaksi di Mukrindo Motor, Anda bisa mencari ulasan dari penjual lain, memahami alur proses mereka secara detail, dan memastikan semua perjanjian tertulis dengan jelas.",
      ],
    },
    {
      title: "Bagaimana sistem pembayaran saat jual di Mukrindo Motor?",
      description: [
        "Sistem pembayaran dapat bervariasi antar platform. Umumnya, setelah mobil lolos inspeksi dan terjadi kesepakatan harga, prosesnya adalah:",
        {
          type: "ordered",
          items: [
            "Penjual menyerahkan dokumen asli kendaraan (BPKB, STNK, dll.).",
            "Pembeli (Mukrindo Motor atau rekanannya) melakukan verifikasi dokumen.",
            "Pembayaran dilakukan ke rekening penjual, biasanya melalui transfer bank.",
            "Bukti transfer diberikan kepada penjual.",
          ],
        },
        "Penting untuk mengkonfirmasi metode pembayaran, waktu pembayaran (kapan dana akan masuk), dan detail lainnya langsung dengan pihak Mukrindo Motor sebelum menyetujui penjualan.",
      ],
    },
  ];

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="px-3 md:px-0"
    >
      <motion.div variants={itemVariants}>
        <TittleText
          text="FAQ Seputar Pembelian Mobil"
          className="mb-4 lg:mb-6 text-center"
        />
      </motion.div>

      {accordionItems.map((item, index) => (
        <motion.div key={index} variants={itemVariants}>
          <Accordion
            key={index}
            title={item.title}
            description={item.description}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default BuyAccordion;
