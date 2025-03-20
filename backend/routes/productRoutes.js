const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

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

module.exports = router;