// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db"); //
const { createServer } = require("http");
const passport = require("passport");
require("./config/passport-setup");
const apiKeyAuth = require("./middleware/apiKeyAuth");

// Impor Rute
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const tradeInRoutes = require("./routes/tradeInRoutes");
const sellRoutes = require("./routes/sellRoutes");
const notifStockRoutes = require("./routes/notifStockRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const visitRoutes = require("./routes/visitRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Utama
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

connectDB();

const httpServer = createServer(app);

// === RUTE ===
app.get("/", (req, res) => {
  //
  res.send("Welcome to the Mukrindo-Motor Backend API");
});

app.use("/api/auth", authRoutes);

// Rute API yang diproteksi oleh apiKeyAuth
app.use("/api/products", apiKeyAuth, productRoutes);
app.use("/api/trade-in", apiKeyAuth, tradeInRoutes);
app.use("/api/sell-requests", apiKeyAuth, sellRoutes);
app.use("/api/notif-stock", apiKeyAuth, notifStockRoutes);
app.use("/api/notifications", apiKeyAuth, notificationRoutes);
app.use("/api/visits", apiKeyAuth, visitRoutes);

// Handler untuk rute tidak ditemukan (404)
app.use((req, res, next) => {
  //
  res.status(404).json({ message: "Resource not found" });
});

app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Terjadi kesalahan pada server.",
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
