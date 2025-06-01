// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Img cloudinary
router.post("/", upload.array("images", 10), productController.createProduct);
router.put("/:id", upload.array("images", 10), productController.updateProduct);

// Create Product
router.post("/", productController.createProduct);

// Get All
router.get("/", productController.getAllProducts);

// Get Id
router.get("/:id", productController.getProductById);

// Update Id
router.put("/:id", productController.updateProduct);

// Delete Id
router.delete("/:id", productController.deleteProduct);

//  View count
router.put("/:id/increment-view", productController.incrementViewCount);

// Rekomendasi
router.get("/:id/recommendations", productController.getProductRecommendations);

// Stats Sales
router.get("/stats/sales", productController.getProductSalesStats);

// Product Report
router.get("/stats/report", productController.getProductReportStats);

module.exports = router;
