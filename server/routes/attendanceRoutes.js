const express = require("express");
const router = express.Router();
const {
  getAttendance,
  markAttendanceBatch,
  updateAttendanceRecord,
  deleteAttendanceRecord,
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/authMiddleware");

// View attendance (students see own; teachers/principals see class)
router.get("/", protect, getAttendance);

// Mark attendance (Teacher/Principal only - Attendance Cycle feature)
router.post("/", protect, authorize("teacher", "principal"), markAttendanceBatch);

// Edit/Delete record (Teacher/Principal only)
router.put("/:id", protect, authorize("teacher", "principal"), updateAttendanceRecord);
router.delete("/:id", protect, authorize("teacher", "principal"), deleteAttendanceRecord);

module.exports = router;
