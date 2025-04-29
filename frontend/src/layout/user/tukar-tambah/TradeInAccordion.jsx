"use client";
import React, { useState } from "react";
import Accordion from "@/components/common/Accordion";

const TradeInAccordion = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (index) => {
    setOpenIndex((prevOpenIndex) => (prevOpenIndex === index ? null : index));
  };

  const accordionItems = [
    {
      title: "Apa saja yang harus dilakukan pada tahap awal tukar tambah?",
      description: [
        "Pada tahap awal tukar tambah, Anda perlu memberikan detail lengkap mengenai mobil lama yang ingin Anda tukarkan.",
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
          ],
        },
        "Detail ini membantu kami melakukan penilaian awal terhadap mobil Anda.",
      ],
    },
    {
      title: "Apa saja yang harus dilakukan pada tahap kedua tukar tambah?",
      description: [
        "Selanjutnya, kami memerlukan data diri Anda agar tim kami dapat menghubungi Anda terkait proses tukar tambah mobil.",
        "Isilah informasi berikut:",
        {
          type: "unordered",
          items: [
            "Nama Lengkap sesuai STNK",
            "Nomor Handphone aktif",
            "Alamat Email aktif",
          ],
        },
      ],
    },
    {
      title: "Apa saja yang harus dilakukan pada tahap ketiga tukar tambah?",
      description: [
        "Tahap ini adalah menentukan di mana dan kapan inspeksi mobil lama Anda akan dilakukan. Inspeksi penting untuk menentukan nilai tukar tambah mobil Anda.",
        "Anda dapat memilih lokasi inspeksi:",
        {
          type: "unordered",
          items: [
            "Di Showroom Rekanan: Pilih alamat showroom yang tersedia.",
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
      ],
    },
    {
      title:
        "Apa saja yang harus dilakukan pada tahap akhir tukar tambah mobil baru",
      description: [
        "Di tahap akhir formulir, Anda dapat memberitahu kami preferensi mobil baru yang Anda inginkan sebagai pengganti mobil lama.",
        "Informasi preferensi meliputi:",
        {
          type: "unordered",
          items: [
            "Merek Mobil Baru",
            "Model Mobil Baru",
            "Varian Mobil Baru",
            "Transmisi Mobil Baru",
            "Warna Mobil Baru",
            "Rentang Harga Mobil Baru",
          ],
        },
        "Informasi ini membantu kami menyiapkan penawaran mobil baru yang sesuai dengan keinginan Anda.",
        "Pastikan Anda juga menyetujui Syarat & Ketentuan serta Kebijakan Privasi sebelum mengirimkan formulir pengajuan tukar tambah.",
      ],
    },
    {
      title: "Dokumen apa saja yang diperlukan untuk tukar tambah?",
      description: [
        "Untuk mobil lama yang akan ditukar, siapkan dokumen kepemilikan yang lengkap dan sah:",
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
        "Kelengkapan dokumen akan mempengaruhi proses dan penilaian mobil Anda.",
        "*Catatan: Kebutuhan dokumen dapat bervariasi, konfirmasikan daftar final dengan pihak Mukrindo Motor.*",
      ],
    },
    {
      title: "Bagaimana kondisi mobil lama yang bisa diterima?",
      description: [
        "Umumnya, mobil yang dapat diterima untuk tukar tambah memenuhi kriteria:",
        {
          type: "unordered",
          items: [
            "Bukan mobil bekas tabrakan parah yang mengubah struktur rangka.",
            "Bukan mobil bekas terendam banjir.",
            "Memiliki dokumen yang sah, lengkap, dan tidak dalam sengketa.",
            "Nomor rangka dan nomor mesin sesuai dengan yang tertera di dokumen.",
          ],
        },
        "Kondisi fisik, mesin, interior, dan kelistrikan juga akan dinilai saat inspeksi.",
        "*Catatan: Kriteria penerimaan spesifik dapat berbeda, hubungi Mukrindo Motor untuk detailnya.*",
      ],
    },
    {
      title: "Bagaimana proses penilaian mobil lama?",
      description: [
        "Penilaian (valuasi) mobil lama Anda dilakukan melalui beberapa tahap:",
        {
          type: "ordered",
          items: [
            "Pengisian data awal oleh Anda (Langkah 1).",
            "Inspeksi fisik menyeluruh oleh tim inspektor profesional (sesuai jadwal di Langkah 3). Inspeksi meliputi kondisi eksterior, interior, mesin, kaki-kaki, dan kelengkapan fitur.",
            "Pengecekan kelengkapan dan keabsahan dokumen.",
            "Penentuan harga berdasarkan hasil inspeksi, data pasar terkini, tahun, tipe, dan kondisi mobil.",
          ],
        },
        "Harga hasil penilaian ini yang akan menjadi nilai tukar tambah (kredit) untuk pembelian mobil baru Anda.",
      ],
    },
    {
      title: "Bagaimana sistem pembayaran/transaksi tukar tambah?",
      description: [
        "Proses transaksi tukar tambah umumnya berjalan sebagai berikut:",
        {
          type: "ordered",
          items: [
            "Mobil lama Anda diinspeksi dan dinilai.",
            "Anda menyetujui harga penilaian mobil lama.",
            "Anda memilih mobil baru yang diinginkan (sesuai preferensi di Langkah 4 atau pilihan lain).",
            "Nilai mobil lama Anda dikurangkan dari harga mobil baru.",
            "Anda membayar sisa kekurangan harga mobil baru (bisa tunai atau melalui pembiayaan/kredit).",
            "Proses serah terima mobil lama dan mobil baru beserta dokumennya.",
          ],
        },
        "Penting untuk memahami semua detail biaya, skema pembayaran, dan jadwal serah terima sebelum menyetujui transaksi.",
        "*Catatan: Alur transaksi spesifik dapat bervariasi, pastikan Anda mendapatkan penjelasan detail dari Mukrindo Motor.*",
      ],
    },
    {
      title: "Apakah proses tukar tambah di Mukrindo Motor aman?",
      description: [
        "Platform atau dealer terpercaya umumnya memastikan keamanan proses tukar tambah melalui:",
        {
          type: "unordered",
          items: [
            "Proses inspeksi yang jelas dan transparan.",
            "Penawaran harga yang wajar dan kompetitif untuk mobil lama.",
            "Proses transaksi dan pembayaran yang terdokumentasi dengan baik.",
            "Bantuan dalam pengurusan administrasi dan dokumen.",
          ],
        },
        "Untuk memastikan keamanan, Anda bisa mencari ulasan, memahami alur proses secara detail, dan memastikan semua kesepakatan tertulis.",
        "*Catatan: Lakukan riset atau tanyakan langsung kepada Mukrindo Motor mengenai jaminan keamanan transaksi mereka.*",
      ],
    },
  ];

  return (
    <div className="container mx-auto">
      <h1 className="text-md lg:text-xl font-medium mb-2 lg:mb-4 text-center text-gray-700">
        FAQ Seputar Tukar Tambah Mobil
      </h1>

      {accordionItems.map((item, index) => (
        <Accordion
          key={index}
          title={item.title}
          description={item.description}
          isOpen={openIndex === index}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
};

export default TradeInAccordion;
