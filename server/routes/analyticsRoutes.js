const express = require("express");
const router = express.Router();
const { getSchoolOverview, getReports } = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Principal analytics & reports
router.get("/overview", protect, authorize("principal"), getSchoolOverview);
router.get("/reports", protect, authorize("principal"), getReports);

module.exports = router;
