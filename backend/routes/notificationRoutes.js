const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  deleteAllNotifications,
} = require("../controllers/notificationController");

router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);
router.delete("/", deleteAllNotifications);

module.exports = router;
