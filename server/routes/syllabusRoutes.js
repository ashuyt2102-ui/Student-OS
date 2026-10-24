const express = require("express");
const router = express.Router();
const {
  getSyllabus,
  createSyllabusTopic,
  updateSyllabusTopic,
  deleteSyllabusTopic,
} = require("../controllers/syllabusController");
const { protect, authorize } = require("../middleware/authMiddleware");

// View syllabus
router.get("/", protect, getSyllabus);

// Manage syllabus (Teacher/Principal only)
router.post("/", protect, authorize("teacher", "principal"), createSyllabusTopic);
router.put("/:id", protect, authorize("teacher", "principal"), updateSyllabusTopic);
router.delete("/:id", protect, authorize("teacher", "principal"), deleteSyllabusTopic);

module.exports = router;
