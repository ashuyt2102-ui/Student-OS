const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  approveTeacher,
  getStudentsByClass,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Students by class (for attendance cycle)
router.get("/class/:className", protect, authorize("teacher", "principal"), getStudentsByClass);

// Principal user management
router.get("/", protect, authorize("principal"), getUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, authorize("principal"), updateUser);
router.delete("/:id", protect, authorize("principal"), deleteUser);
router.put("/:id/approve", protect, authorize("principal"), approveTeacher);

module.exports = router;
