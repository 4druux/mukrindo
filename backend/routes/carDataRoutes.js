// backend/routes/carDataRoutes.js
const express = require("express");
const router = express.Router();
const carDataController = require("../controllers/carDataController");
const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authenticateToken");
const apiKeyAuth = require("../middleware/apiKeyAuth");

router.get("/all-data", apiKeyAuth, carDataController.getAllCarData);

router.post(
  "/brands",
  apiKeyAuth,
  authenticateToken,
  authorizeAdmin,
  carDataController.addBrand
);

router.post(
  "/models",
  apiKeyAuth,
  authenticateToken,
  authorizeAdmin,
  carDataController.addModelToBrand
);

router.post(
  "/variants",
  apiKeyAuth,
  authenticateToken,
  authorizeAdmin,
  carDataController.addVariantToModel
);

router.delete(
  "/brands",
  apiKeyAuth,
  authenticateToken,
  authorizeAdmin,
  carDataController.deleteBrand
);

router.delete(
  "/models",
  apiKeyAuth,
  authenticateToken,
  authorizeAdmin,
  carDataController.deleteModelFromBrand
);

router.delete(
  "/variants",
  apiKeyAuth,
  authenticateToken,
  authorizeAdmin,
  carDataController.deleteVariantFromModel
);

module.exports = router;
