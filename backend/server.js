// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db"); //
const { createServer } = require("http");

// Middleware Otentikasi API Key
const apiKeyAuth = require("./middleware/apiKeyAuth"); // Pastikan path ini benar

// Impor Rute
const productRoutes = require("./routes/productRoutes"); //
const tradeInRoutes = require("./routes/tradeInRoutes"); //
const sellRoutes = require("./routes/sellRoutes"); //
const notifStockRoutes = require("./routes/notifStockRoutes"); //
const notificationRoutes = require("./routes/notificationRoutes"); //
const visitRoutes = require("./routes/visitRoutes"); //
// const authRoutes = require("./routes/authRoutes"); // Jika Anda punya auth untuk admin, biarkan ini. Jika tidak, hapus.

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Utama
app.use(helmet()); // Mengatur header HTTP keamanan
app.use(
  cors({
    // Konfigurasi Cross-Origin Resource Sharing
    origin: process.env.FRONTEND_URL || "http://localhost:3000", //
    credentials: false, // Set ke false jika tidak menggunakan cookies/session lintas domain
  })
);
app.use(express.json({ limit: "10mb" })); // Mem-parse body JSON
app.use(express.urlencoded({ limit: "10mb", extended: true })); // Mem-parse body URL-encoded
app.use(cookieParser()); // Mem-parse cookie

// Koneksi ke database MongoDB
connectDB(); //

// Membuat server HTTP
const httpServer = createServer(app); //

// === RUTE ===
// Rute publik untuk root
app.get("/", (req, res) => {
  //
  res.send("Welcome to the Mukrindo-Motor Backend API");
});

// Jika Anda memiliki rute autentikasi admin (login admin), letakkan DI ATAS apiKeyAuth
// Contoh: app.use("/api/auth", authRoutes);
// Rute ini akan menggunakan mekanisme autentikasi sendiri (misalnya JWT)
// dan TIDAK boleh diproteksi oleh apiKeyAuth umum.

// Middleware apiKeyAuth untuk semua rute di bawah /api/*
app.use("/api", apiKeyAuth);

// Rute API yang diproteksi oleh apiKeyAuth
app.use("/api/products", productRoutes); //
app.use("/api/trade-in", tradeInRoutes); //
app.use("/api/sell-requests", sellRoutes); //
app.use("/api/notif-stock", notifStockRoutes); //
app.use("/api/notifications", notificationRoutes); //
app.use("/api/visits", visitRoutes); //

// Handler untuk rute tidak ditemukan (404)
app.use((req, res, next) => {
  //
  res.status(404).json({ message: "Resource not found" });
});

// Handler error global
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Terjadi kesalahan pada server.",
    // Jangan kirim stack trace ke klien di produksi
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// Menjalankan server
httpServer.listen(PORT, () => {
  //
  console.log(`Server running on port ${PORT}`);
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.FRONTEND_URL ||
      process.env.FRONTEND_URL === "http://localhost:3000")
  ) {
    console.warn(
      "PERINGATAN: FRONTEND_URL belum diset dengan benar untuk produksi di file .env backend."
    );
  }
});
