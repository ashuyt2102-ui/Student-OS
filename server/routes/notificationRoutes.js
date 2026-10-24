const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markNotificationRead,
  createNotification,
} = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, getNotifications);
router.put("/:id/read", protect, markNotificationRead);
router.post("/", protect, authorize("teacher", "principal"), createNotification);

module.exports = router;
