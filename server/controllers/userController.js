const User = require("../models/User");

// @desc    Get all users (filter by role/class optional)
// @route   GET /api/users
// @access  Principal only
const getUsers = async (req, res) => {
  const query = {};
  if (req.query.role) query.role = req.query.role;
  if (req.query.grade) query.grade = req.query.grade;
  if (req.query.isApproved !== undefined) query.isApproved = req.query.isApproved === "true";

  const users = await User.find(query).select("-password").sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, users });
};

// @desc    Get single user by id
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.status(200).json({ success: true, user });
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Principal only
const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const { name, email, role, grade, section, subject, studentId, isApproved } = req.body;

  if (name) user.name = name;
  if (email) user.email = email.toLowerCase().trim();
  if (role) user.role = role;
  if (grade) user.grade = grade;
  if (section) user.section = section;
  if (subject !== undefined) user.subject = subject;
  if (studentId !== undefined) user.studentId = studentId;
  if (isApproved !== undefined) user.isApproved = isApproved;

  const updatedUser = await user.save();
  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user: updatedUser,
  });
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Principal only
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: "User removed successfully" });
};

// @desc    Approve teacher account
// @route   PUT /api/users/:id/approve
// @access  Principal only
const approveTeacher = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  user.isApproved = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: `${user.name} (${user.role}) has been approved and can now access the system.`,
    user,
  });
};

// @desc    Get students by class for teacher attendance cycle
// @route   GET /api/users/class/:className
// @access  Teacher / Principal
const getStudentsByClass = async (req, res) => {
  const className = req.params.className; // e.g. "Grade 11 Science" or separate grade/section

  // Match either exact class or split by grade & section
  let query = { role: "student" };
  if (className && className !== "all") {
    const parts = className.split(" ");
    if (parts.length >= 3) {
      query.grade = `${parts[0]} ${parts[1]}`;
      query.section = parts.slice(2).join(" ");
    } else {
      query.$or = [{ grade: className }, { section: className }];
    }
  }

  const students = await User.find(query)
    .select("name email studentId grade section avatar")
    .sort({ name: 1 });

  res.status(200).json({ success: true, count: students.length, students });
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  approveTeacher,
  getStudentsByClass,
};
