const express = require("express");
const router = express.Router();

const { handleClusteringLog } = require("../controllers/logController");

const apiKeyAuth = require("../middleware/apiKeyAuth");

router.post("/clustering", apiKeyAuth, handleClusteringLog);

module.exports = router;
