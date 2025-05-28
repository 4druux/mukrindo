// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 },
});

// Img cloudinary
router.post("/", upload.array("images", 10), productController.createProduct);
router.put("/:id", upload.array("images", 10), productController.updateProduct);

// Route untuk membuat produk baru
router.post("/", productController.createProduct);

// Route untuk mendapatkan semua produk
router.get("/", productController.getAllProducts);

// Route untuk mendapatkan produk berdasarkan ID
router.get("/:id", productController.getProductById);

// Route untuk memperbarui produk berdasarkan ID
router.put("/:id", productController.updateProduct);

// Route untuk menghapus produk berdasarkan ID
router.delete("/:id", productController.deleteProduct);

// Route baru untuk increment view count
router.put("/:id/increment-view", productController.incrementViewCount);

module.exports = router;
