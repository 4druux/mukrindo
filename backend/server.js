const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const { createServer } = require("http");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = process.env.PORT || 5000;
const path = require("path");
const productRoutes = require("./routes/productRoutes");
const tradeInRoutes = require("./routes/tradeInRoutes");
const sellRoutes = require("./routes/sellRoutes");
const notifStockRoutes = require("./routes/notifStockRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const visitRoutes = require("./routes/visitRoutes");

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// MongoDB Connection
console.log("Attempting MongoDB connection...");
connectDB();
console.log("MongoDB connection attempted");

// Create HTTP Server
const httpServer = createServer(app);

// Routes
console.log("Setting up routes...");

// Default route for root
app.get("/", (req, res) => {
  res.send("Welcome to the Mukrindo-Motor Backend API");
});

app.use("/api/products", productRoutes);
app.use("/api/trade-in", tradeInRoutes);
app.use("/api/sell-requests", sellRoutes);
app.use("/api/notif-stock", notifStockRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/visits", visitRoutes);

// 404 Route
app.use((req, res, next) => {
  res.status(404).send("404 Not Found");
});

// Start Server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
