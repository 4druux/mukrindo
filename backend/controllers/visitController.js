// controllers/visitController.js
const trackingVisit = require("../models/trackingVisit");
const { v4: uuidv4 } = require("uuid"); // Untuk generate ID unik
const { startOfMonth, endOfMonth, subMonths } = require("date-fns"); // Untuk kalkulasi tanggal

const VISITOR_COOKIE_NAME =
  process.env.VISITOR_COOKIE_NAME || "mukrindo_visitor_id"; // Nama cookie

// Fungsi untuk melacak kunjungan ke beranda
exports.trackHomepageVisit = async (req, res) => {
  try {
    let visitorId = req.cookies[VISITOR_COOKIE_NAME];

    if (!visitorId) {
      visitorId = uuidv4();
      res.cookie(VISITOR_COOKIE_NAME, visitorId, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    const ipAddress =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    // Menggunakan findOneAndUpdate untuk membuat atau memperbarui entri
    const updatedVisitEntry = await trackingVisit.findOneAndUpdate(
      { visitorCookieId: visitorId }, // Kriteria pencarian: cari berdasarkan visitorCookieId
      {
        // Data yang akan diatur atau diperbarui
        $set: {
          ipAddress: ipAddress,
          userAgent: userAgent,
          visitTimestamp: new Date(), // Selalu perbarui timestamp ke waktu kunjungan terakhir
        },
        // $setOnInsert akan mengatur field ini hanya jika dokumen baru dibuat (operasi insert)
        // Ini berguna jika Anda ingin menyimpan timestamp kunjungan pertama secara terpisah
        // $setOnInsert: {
        //   firstVisitTimestamp: new Date()
        // }
      },
      {
        upsert: true, // Jika tidak ada dokumen yang cocok, buat dokumen baru
        new: true, // Kembalikan dokumen yang sudah diperbarui (atau yang baru dibuat)
        setDefaultsOnInsert: true, // Terapkan default schema jika dokumen baru dibuat
      }
    );

    res.status(200).json({
      message: "Homepage visit tracked/updated successfully",
      visitorId: updatedVisitEntry.visitorCookieId, // atau visitorId
      // entry: updatedVisitEntry // Anda bisa mengirim kembali entri yang di-upsert jika perlu
    });
  } catch (error) {
    console.error("Error tracking/updating homepage visit:", error);
    res
      .status(500)
      .json({ message: "Internal server error while tracking/updating visit" });
  }
};

// Fungsi untuk mendapatkan statistik kunjungan (untuk dashboard admin)
exports.getHomepageVisitStats = async (req, res) => {
  try {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    const prevMonthDate = subMonths(now, 1); // Tanggal di bulan sebelumnya
    const prevMonthStart = startOfMonth(prevMonthDate);
    const prevMonthEnd = endOfMonth(prevMonthDate);

    // Helper function untuk menghitung pengunjung unik dengan MongoDB Aggregation Pipeline
    const countUniqueVisitors = async (matchQuery = {}) => {
      const result = await trackingVisit.aggregate([
        { $match: matchQuery }, // Filter berdasarkan kriteria (misalnya rentang tanggal)
        { $group: { _id: "$visitorCookieId" } }, // Kelompokkan berdasarkan visitorCookieId untuk mendapatkan unik
        { $count: "uniqueCount" }, // Hitung jumlah grup unik
      ]);
      return result.length > 0 ? result[0].uniqueCount : 0;
    };

    // Hitung total pengunjung unik sepanjang waktu
    const totalUniqueVisitorsOverall = await countUniqueVisitors({});

    // Hitung pengunjung unik bulan ini
    const uniqueVisitorsThisMonth = await countUniqueVisitors({
      visitTimestamp: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });

    // Hitung pengunjung unik bulan lalu
    const uniqueVisitorsLastMonth = await countUniqueVisitors({
      visitTimestamp: { $gte: prevMonthStart, $lte: prevMonthEnd },
    });

    res.status(200).json({
      totalUniqueVisitorsOverall,
      uniqueVisitorsThisMonth,
      uniqueVisitorsLastMonth,
    });
  } catch (error) {
    console.error("Error fetching homepage visit stats:", error);
    res
      .status(500)
      .json({ message: "Internal server error while fetching stats" });
  }
};
