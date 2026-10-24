const express = require("express");
const router = express.Router();
const { getMarks, addMarks, updateMarks, deleteMarks } = require("../controllers/marksController");
const { protect, authorize } = require("../middleware/authMiddleware");

// View marks
router.get("/", protect, getMarks);

// Add marks (Teacher/Principal only)
router.post("/", protect, authorize("teacher", "principal"), addMarks);

// Edit/Delete marks (Teacher/Principal only)
router.put("/:id", protect, authorize("teacher", "principal"), updateMarks);
router.delete("/:id", protect, authorize("teacher", "principal"), deleteMarks);

module.exports = router;
