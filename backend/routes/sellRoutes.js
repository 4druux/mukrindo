const express = require("express");
const {
  createSellRequest, // Ganti nama fungsi
  getAllSellRequests, // Ganti nama fungsi
  getSellRequestById, // Ganti nama fungsi
  updateSellRequestStatus, // Ganti nama fungsi
} = require("../controllers/sellController"); // Import controller yang benar
const router = express.Router();

// Endpoint tetap sama relatif terhadap base path, tapi controllernya beda
router.post("/", createSellRequest);
router.get("/", getAllSellRequests);
router.get("/:id", getSellRequestById);
router.patch("/:id", updateSellRequestStatus);

module.exports = router;
