// routes/visitRoutes.js
const express = require("express");
const router = express.Router();
const visitController = require("../controllers/visitController");

router.post("/homepage/track", visitController.trackHomepageVisit);
router.get("/homepage/stats", visitController.getHomepageVisitStats);

module.exports = router;
