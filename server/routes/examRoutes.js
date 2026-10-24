const express = require("express");
const router = express.Router();
const { getExams, createExam, updateExam, deleteExam } = require("../controllers/examController");
const { protect, authorize } = require("../middleware/authMiddleware");

// View exams
router.get("/", protect, getExams);

// Manage exams (Teacher/Principal only)
router.post("/", protect, authorize("teacher", "principal"), createExam);
router.put("/:id", protect, authorize("teacher", "principal"), updateExam);
router.delete("/:id", protect, authorize("teacher", "principal"), deleteExam);

module.exports = router;
